import { GoogleGenerativeAI, GoogleAIFileManager } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

export class GeminiService {
  /**
   * Upload a file to Gemini for file search
   * @param filePath Path to the file to upload
   * @param displayName Display name for the file
   * @returns File upload response with file ID
   */
  async uploadFile(filePath: string, displayName: string) {
    try {
      const uploadResponse = await fileManager.uploadFile(filePath, {
        mimeType: this.getMimeType(filePath),
        displayName: displayName,
      });

      return {
        fileId: uploadResponse.file.name,
        uri: uploadResponse.file.uri,
        mimeType: uploadResponse.file.mimeType,
      };
    } catch (error) {
      console.error('Error uploading file to Gemini:', error);
      throw new Error('Failed to upload file to Gemini');
    }
  }

  /**
   * Upload CV to Gemini for semantic search
   */
  async uploadCV(cvPath: string, candidateName: string) {
    return this.uploadFile(cvPath, `CV_${candidateName}`);
  }

  /**
   * Upload Job Description to Gemini
   */
  async uploadJobDescription(jdContent: string, jdTitle: string) {
    // Create temporary file
    const tempPath = path.join('/tmp', `jd_${Date.now()}.txt`);
    fs.writeFileSync(tempPath, jdContent);

    const result = await this.uploadFile(tempPath, `JD_${jdTitle}`);

    // Clean up temp file
    fs.unlinkSync(tempPath);

    return result;
  }

  /**
   * Match candidate CV with Job Description using Gemini AI
   */
  async matchCVWithJD(cvFileId: string, jdContent: string, candidateData: any) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt = `
You are an expert HR recruiter. Analyze the candidate's CV and match it against the following job description.

JOB DESCRIPTION:
${jdContent}

CANDIDATE INFORMATION:
- Name: ${candidateData.firstName} ${candidateData.lastName}
- Skills: ${candidateData.skills?.join(', ') || 'Not specified'}
- Experience: ${candidateData.experience || 'Not specified'} years
- Education: ${candidateData.education?.join(', ') || 'Not specified'}

Please provide a detailed matching analysis in JSON format with the following structure:
{
  "overallScore": <number 0-100>,
  "skillScore": <number 0-100>,
  "experienceScore": <number 0-100>,
  "educationScore": <number 0-100>,
  "strengths": [<list of matching strengths>],
  "gaps": [<list of skill or experience gaps>],
  "recommendations": "<hiring recommendation>",
  "detailedAnalysis": "<detailed text analysis>"
}

Be thorough and objective in your assessment.
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Failed to parse Gemini response');
    } catch (error) {
      console.error('Error matching CV with JD:', error);
      throw new Error('Failed to match CV with JD using Gemini');
    }
  }

  /**
   * Search for similar skills in the skill database
   */
  async searchSimilarSkills(skillQuery: string, fileIds: string[]) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt = `
Find skills similar to: "${skillQuery}"

Consider synonyms, related technologies, and skill variations.
Return a JSON array of similar skills with relevance scores.

Format:
[
  {
    "skill": "<skill name>",
    "relevance": <number 0-100>,
    "category": "<category>"
  }
]
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error) {
      console.error('Error searching similar skills:', error);
      return [];
    }
  }

  /**
   * Generate proposal content using stored skills and capabilities
   */
  async generateProposal(
    clientRequirements: string,
    availableSkills: string[],
    candidateProfiles: any[],
    proposalType: string
  ) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt = `
You are a professional proposal writer for an HR outsourcing company.

CLIENT REQUIREMENTS:
${clientRequirements}

AVAILABLE SKILLS IN OUR TALENT POOL:
${availableSkills.join(', ')}

CANDIDATE PROFILES:
${JSON.stringify(candidateProfiles, null, 2)}

PROPOSAL TYPE: ${proposalType}

Generate a professional proposal document with the following sections:
1. Executive Summary
2. Understanding of Requirements
3. Proposed Solution
4. Team Composition (matching candidates to requirements)
5. Timeline
6. Pricing Structure
7. Why Choose Us
8. Next Steps

Format the output in Markdown.
`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating proposal:', error);
      throw new Error('Failed to generate proposal using Gemini');
    }
  }

  /**
   * Extract skills from CV text using AI
   */
  async extractSkillsFromCV(cvText: string) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
Extract all technical and professional skills from the following CV text.
Return a JSON object with categorized skills.

CV TEXT:
${cvText}

Return format:
{
  "technicalSkills": [<array of technical skills>],
  "softSkills": [<array of soft skills>],
  "languages": [<array of programming/spoken languages>],
  "tools": [<array of tools and technologies>],
  "certifications": [<array of certifications>]
}
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        technicalSkills: [],
        softSkills: [],
        languages: [],
        tools: [],
        certifications: []
      };
    } catch (error) {
      console.error('Error extracting skills from CV:', error);
      return null;
    }
  }

  /**
   * Delete uploaded file from Gemini
   */
  async deleteFile(fileId: string) {
    try {
      await fileManager.deleteFile(fileId);
      return true;
    } catch (error) {
      console.error('Error deleting file from Gemini:', error);
      return false;
    }
  }

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.json': 'application/json',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export default new GeminiService();
