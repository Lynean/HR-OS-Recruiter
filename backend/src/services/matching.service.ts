import { PrismaClient } from '@prisma/client';
import geminiService from './gemini.service';
import natural from 'natural';

const prisma = new PrismaClient();
const TfIdf = natural.TfIdf;

export class MatchingService {
  /**
   * Match candidate with job description using hybrid approach
   * Combines traditional algorithms with AI analysis
   */
  async matchCandidateWithJD(candidateId: string, jobDescriptionId: string) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId }
      });

      const jd = await prisma.jobDescription.findUnique({
        where: { id: jobDescriptionId }
      });

      if (!candidate || !jd) {
        throw new Error('Candidate or Job Description not found');
      }

      // 1. Calculate skill matching score
      const skillScore = this.calculateSkillScore(
        candidate.skills,
        jd.requiredSkills,
        jd.preferredSkills
      );

      // 2. Calculate experience score
      const experienceScore = this.calculateExperienceScore(
        candidate.experience || 0,
        jd.minExperience || 0,
        jd.maxExperience || 999
      );

      // 3. Calculate education score (simplified)
      const educationScore = this.calculateEducationScore(
        candidate.education || [],
        jd.requirements
      );

      // 4. Get AI-powered detailed analysis from Gemini
      const jdContent = `
Title: ${jd.title}
Description: ${jd.description}
Requirements: ${jd.requirements}
Required Skills: ${jd.requiredSkills.join(', ')}
Preferred Skills: ${jd.preferredSkills.join(', ')}
Experience: ${jd.minExperience}-${jd.maxExperience} years
`;

      let geminiAnalysis = null;
      try {
        geminiAnalysis = await geminiService.matchCVWithJD(
          candidate.geminiFileId || '',
          jdContent,
          candidate
        );
      } catch (error) {
        console.error('Gemini analysis failed:', error);
      }

      // 5. Calculate overall score (weighted average)
      const overallScore = geminiAnalysis
        ? geminiAnalysis.overallScore
        : (skillScore * 0.5 + experienceScore * 0.3 + educationScore * 0.2);

      // 6. Save match to database
      const match = await prisma.candidateMatch.upsert({
        where: {
          candidateId_jobDescriptionId: {
            candidateId,
            jobDescriptionId
          }
        },
        update: {
          overallScore,
          skillScore: geminiAnalysis?.skillScore || skillScore,
          experienceScore: geminiAnalysis?.experienceScore || experienceScore,
          educationScore: geminiAnalysis?.educationScore || educationScore,
          matchDetails: geminiAnalysis || {
            skillScore,
            experienceScore,
            educationScore
          },
          geminiAnalysis: geminiAnalysis?.detailedAnalysis || null
        },
        create: {
          candidateId,
          jobDescriptionId,
          overallScore,
          skillScore: geminiAnalysis?.skillScore || skillScore,
          experienceScore: geminiAnalysis?.experienceScore || experienceScore,
          educationScore: geminiAnalysis?.educationScore || educationScore,
          matchDetails: geminiAnalysis || {
            skillScore,
            experienceScore,
            educationScore
          },
          geminiAnalysis: geminiAnalysis?.detailedAnalysis || null
        }
      });

      return match;
    } catch (error) {
      console.error('Error matching candidate with JD:', error);
      throw new Error('Failed to match candidate with job description');
    }
  }

  /**
   * Get top matching candidates for a job description
   */
  async getTopCandidatesForJD(
    jobDescriptionId: string,
    limit: number = 10,
    minScore: number = 60
  ) {
    try {
      const matches = await prisma.candidateMatch.findMany({
        where: {
          jobDescriptionId,
          overallScore: {
            gte: minScore
          }
        },
        include: {
          candidate: true
        },
        orderBy: {
          overallScore: 'desc'
        },
        take: limit
      });

      return matches;
    } catch (error) {
      console.error('Error getting top candidates:', error);
      throw new Error('Failed to get top candidates');
    }
  }

  /**
   * Calculate skill matching score
   */
  private calculateSkillScore(
    candidateSkills: string[],
    requiredSkills: string[],
    preferredSkills: string[]
  ): number {
    if (!candidateSkills || candidateSkills.length === 0) return 0;

    const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase());
    const normalizedRequired = requiredSkills.map(s => s.toLowerCase());
    const normalizedPreferred = preferredSkills.map(s => s.toLowerCase());

    // Count matching required skills
    const matchingRequired = normalizedRequired.filter(skill =>
      normalizedCandidateSkills.includes(skill)
    ).length;

    // Count matching preferred skills
    const matchingPreferred = normalizedPreferred.filter(skill =>
      normalizedCandidateSkills.includes(skill)
    ).length;

    // Calculate score (required skills weighted more heavily)
    const requiredScore = requiredSkills.length > 0
      ? (matchingRequired / requiredSkills.length) * 70
      : 0;

    const preferredScore = preferredSkills.length > 0
      ? (matchingPreferred / preferredSkills.length) * 30
      : 30; // Full score if no preferred skills specified

    return Math.min(100, requiredScore + preferredScore);
  }

  /**
   * Calculate experience matching score
   */
  private calculateExperienceScore(
    candidateExp: number,
    minExp: number,
    maxExp: number
  ): number {
    if (candidateExp < minExp) {
      // Penalize if below minimum
      const deficit = minExp - candidateExp;
      return Math.max(0, 100 - (deficit * 20));
    } else if (candidateExp > maxExp) {
      // Slight penalty if overqualified
      const excess = candidateExp - maxExp;
      return Math.max(70, 100 - (excess * 5));
    } else {
      // Perfect match within range
      return 100;
    }
  }

  /**
   * Calculate education score (simplified)
   */
  private calculateEducationScore(
    candidateEducation: string[],
    requirements: string
  ): number {
    if (!candidateEducation || candidateEducation.length === 0) return 50;

    // Simple keyword matching
    const educationText = candidateEducation.join(' ').toLowerCase();
    const requirementsLower = requirements.toLowerCase();

    let score = 50; // Base score

    // Check for degree levels
    if (requirementsLower.includes('bachelor') && educationText.includes('bachelor')) {
      score += 20;
    }
    if (requirementsLower.includes('master') && educationText.includes('master')) {
      score += 20;
    }
    if (requirementsLower.includes('phd') || requirementsLower.includes('doctorate')) {
      if (educationText.includes('phd') || educationText.includes('doctorate')) {
        score += 30;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Batch match all candidates with a job description
   */
  async batchMatchCandidates(jobDescriptionId: string) {
    try {
      const candidates = await prisma.candidate.findMany({
        where: {
          status: {
            in: ['NEW', 'SCREENING', 'ACTIVE']
          }
        }
      });

      const results = [];
      for (const candidate of candidates) {
        try {
          const match = await this.matchCandidateWithJD(candidate.id, jobDescriptionId);
          results.push(match);
        } catch (error) {
          console.error(`Failed to match candidate ${candidate.id}:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error('Error in batch matching:', error);
      throw new Error('Failed to batch match candidates');
    }
  }
}

export default new MatchingService();
