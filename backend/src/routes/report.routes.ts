import { Router, Request, Response } from 'express';
import reportService from '../services/report.service';

const router = Router();

/**
 * Get dashboard statistics
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const stats = await reportService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

/**
 * Get recruitment funnel
 */
router.get('/funnel', async (req: Request, res: Response) => {
  try {
    const { jobDescriptionId } = req.query;
    const funnel = await reportService.getRecruitmentFunnel(jobDescriptionId as string);
    res.json(funnel);
  } catch (error) {
    console.error('Get funnel error:', error);
    res.status(500).json({ error: 'Failed to get recruitment funnel' });
  }
});

/**
 * Get time-to-hire metrics
 */
router.get('/time-to-hire', async (req: Request, res: Response) => {
  try {
    const { jobDescriptionId } = req.query;
    const metrics = await reportService.getTimeToHire(jobDescriptionId as string);
    res.json(metrics);
  } catch (error) {
    console.error('Get time-to-hire error:', error);
    res.status(500).json({ error: 'Failed to get time-to-hire metrics' });
  }
});

/**
 * Get source effectiveness
 */
router.get('/source-effectiveness', async (req: Request, res: Response) => {
  try {
    const effectiveness = await reportService.getSourceEffectiveness();
    res.json(effectiveness);
  } catch (error) {
    console.error('Get source effectiveness error:', error);
    res.status(500).json({ error: 'Failed to get source effectiveness' });
  }
});

/**
 * Get interview statistics
 */
router.get('/interviews', async (req: Request, res: Response) => {
  try {
    const { period } = req.query;
    const stats = await reportService.getInterviewStats(period as any || 'month');
    res.json(stats);
  } catch (error) {
    console.error('Get interview stats error:', error);
    res.status(500).json({ error: 'Failed to get interview statistics' });
  }
});

export default router;
