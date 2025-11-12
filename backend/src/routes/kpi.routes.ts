import { Router, Request, Response } from 'express';
import kpiService from '../services/kpi.service';

const router = Router();

/**
 * Create KPI
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const kpi = await kpiService.createKPI(req.body);
    res.status(201).json(kpi);
  } catch (error) {
    console.error('Create KPI error:', error);
    res.status(500).json({ error: 'Failed to create KPI' });
  }
});

/**
 * Update KPI progress
 */
router.put('/:id/progress', async (req: Request, res: Response) => {
  try {
    const { current, userId } = req.body;
    const kpi = await kpiService.updateKPIProgress(req.params.id, current, userId || 'system');
    res.json(kpi);
  } catch (error) {
    console.error('Update KPI error:', error);
    res.status(500).json({ error: 'Failed to update KPI' });
  }
});

/**
 * Get KPIs for a candidate
 */
router.get('/candidate/:candidateId', async (req: Request, res: Response) => {
  try {
    const kpis = await kpiService.getCandidateKPIs(req.params.candidateId);
    res.json(kpis);
  } catch (error) {
    console.error('Get KPIs error:', error);
    res.status(500).json({ error: 'Failed to get KPIs' });
  }
});

/**
 * Get KPI summary
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.query;
    const summary = await kpiService.getKPISummary(candidateId as string);
    res.json(summary);
  } catch (error) {
    console.error('Get KPI summary error:', error);
    res.status(500).json({ error: 'Failed to get KPI summary' });
  }
});

/**
 * Get all KPIs
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { prisma } = await import('../index');
    const kpis = await prisma.kPI.findMany({
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        assigner: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const kpisWithProgress = kpis.map(kpi => ({
      ...kpi,
      progress: (kpi.current / kpi.target) * 100
    }));

    res.json(kpisWithProgress);
  } catch (error) {
    console.error('Get KPIs error:', error);
    res.status(500).json({ error: 'Failed to get KPIs' });
  }
});

export default router;
