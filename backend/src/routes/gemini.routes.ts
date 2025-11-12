import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import geminiService from '../services/gemini.service';

const router = Router();
const prisma = new PrismaClient();

/**
 * Search similar skills
 */
router.post('/skills/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    // Get all skill file IDs from database
    const skills = await prisma.skillDatabase.findMany({
      select: { geminiFileId: true }
    });

    const fileIds = skills
      .map(s => s.geminiFileId)
      .filter(Boolean) as string[];

    const similarSkills = await geminiService.searchSimilarSkills(query, fileIds);
    res.json(similarSkills);
  } catch (error) {
    console.error('Search skills error:', error);
    res.status(500).json({ error: 'Failed to search skills' });
  }
});

/**
 * Generate proposal
 */
router.post('/proposal/generate', async (req: Request, res: Response) => {
  try {
    const { clientRequirements, candidateIds, proposalType } = req.body;

    // Get available skills
    const skills = await prisma.skillDatabase.findMany({
      select: { skillName: true }
    });

    // Get candidate profiles
    const candidates = await prisma.candidate.findMany({
      where: {
        id: { in: candidateIds }
      },
      select: {
        firstName: true,
        lastName: true,
        skills: true,
        experience: true,
        education: true
      }
    });

    const proposal = await geminiService.generateProposal(
      clientRequirements,
      skills.map(s => s.skillName),
      candidates,
      proposalType
    );

    res.json({ proposal });
  } catch (error) {
    console.error('Generate proposal error:', error);
    res.status(500).json({ error: 'Failed to generate proposal' });
  }
});

/**
 * Add skill to database
 */
router.post('/skills', async (req: Request, res: Response) => {
  try {
    const { skillName, category, description, relatedSkills } = req.body;

    const skill = await prisma.skillDatabase.upsert({
      where: { skillName },
      update: {
        category,
        description,
        relatedSkills,
        usageCount: { increment: 1 }
      },
      create: {
        skillName,
        category,
        description,
        relatedSkills: relatedSkills || []
      }
    });

    res.status(201).json(skill);
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

/**
 * Get all skills
 */
router.get('/skills', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.skillName = {
        contains: search as string,
        mode: 'insensitive'
      };
    }

    const skills = await prisma.skillDatabase.findMany({
      where,
      orderBy: { usageCount: 'desc' }
    });

    res.json(skills);
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Failed to get skills' });
  }
});

/**
 * Extract skills from text using AI
 */
router.post('/extract-skills', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    const skills = await geminiService.extractSkillsFromCV(text);
    res.json(skills);
  } catch (error) {
    console.error('Extract skills error:', error);
    res.status(500).json({ error: 'Failed to extract skills' });
  }
});

export default router;
