import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Create job description
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const jd = await prisma.jobDescription.create({
      data: {
        ...req.body,
        createdBy: req.body.createdBy || 'system' // Should come from auth middleware
      }
    });

    res.status(201).json(jd);
  } catch (error) {
    console.error('Create JD error:', error);
    res.status(500).json({ error: 'Failed to create job description' });
  }
});

/**
 * Get all job descriptions
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, limit, offset } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const jds = await prisma.jobDescription.findMany({
      where,
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            matches: true
          }
        }
      },
      take: limit ? parseInt(limit as string) : 50,
      skip: offset ? parseInt(offset as string) : 0,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.jobDescription.count({ where });

    res.json({ jobDescriptions: jds, total });
  } catch (error) {
    console.error('Get JDs error:', error);
    res.status(500).json({ error: 'Failed to get job descriptions' });
  }
});

/**
 * Get job description by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const jd = await prisma.jobDescription.findUnique({
      where: { id: req.params.id },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        matches: {
          include: {
            candidate: true
          },
          orderBy: {
            overallScore: 'desc'
          }
        }
      }
    });

    if (!jd) {
      return res.status(404).json({ error: 'Job description not found' });
    }

    res.json(jd);
  } catch (error) {
    console.error('Get JD error:', error);
    res.status(500).json({ error: 'Failed to get job description' });
  }
});

/**
 * Update job description
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const jd = await prisma.jobDescription.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(jd);
  } catch (error) {
    console.error('Update JD error:', error);
    res.status(500).json({ error: 'Failed to update job description' });
  }
});

/**
 * Delete job description
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.jobDescription.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Job description deleted successfully' });
  } catch (error) {
    console.error('Delete JD error:', error);
    res.status(500).json({ error: 'Failed to delete job description' });
  }
});

export default router;
