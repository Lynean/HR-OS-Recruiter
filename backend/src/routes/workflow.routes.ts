import { Router, Request, Response } from 'express';
import workflowService from '../services/workflow.service';

const router = Router();

/**
 * Schedule interview
 */
router.post('/interview', async (req: Request, res: Response) => {
  try {
    const interview = await workflowService.scheduleInterview(req.body);
    res.status(201).json(interview);
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ error: 'Failed to schedule interview' });
  }
});

/**
 * Send offer letter
 */
router.post('/offer', async (req: Request, res: Response) => {
  try {
    const offer = await workflowService.sendOffer(req.body);
    res.status(201).json(offer);
  } catch (error) {
    console.error('Send offer error:', error);
    res.status(500).json({ error: 'Failed to send offer' });
  }
});

/**
 * Accept offer
 */
router.post('/offer/:id/accept', async (req: Request, res: Response) => {
  try {
    const offer = await workflowService.acceptOffer(req.params.id);
    res.json(offer);
  } catch (error) {
    console.error('Accept offer error:', error);
    res.status(500).json({ error: 'Failed to accept offer' });
  }
});

/**
 * Start onboarding
 */
router.post('/onboarding', async (req: Request, res: Response) => {
  try {
    const onboarding = await workflowService.startOnboarding(req.body);
    res.status(201).json(onboarding);
  } catch (error) {
    console.error('Start onboarding error:', error);
    res.status(500).json({ error: 'Failed to start onboarding' });
  }
});

/**
 * Assign training
 */
router.post('/training', async (req: Request, res: Response) => {
  try {
    const training = await workflowService.assignTraining(req.body);
    res.status(201).json(training);
  } catch (error) {
    console.error('Assign training error:', error);
    res.status(500).json({ error: 'Failed to assign training' });
  }
});

/**
 * Assign outsourcing
 */
router.post('/outsource', async (req: Request, res: Response) => {
  try {
    const outsourcing = await workflowService.assignOutsourcing(req.body);
    res.status(201).json(outsourcing);
  } catch (error) {
    console.error('Assign outsourcing error:', error);
    res.status(500).json({ error: 'Failed to assign outsourcing' });
  }
});

/**
 * Get all interviews
 */
router.get('/interviews', async (req: Request, res: Response) => {
  try {
    const { prisma } = await import('../index');
    const interviews = await prisma.interview.findMany({
      include: {
        candidate: true,
        jobDescription: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(interviews);
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ error: 'Failed to get interviews' });
  }
});

/**
 * Get all offers
 */
router.get('/offers', async (req: Request, res: Response) => {
  try {
    const { prisma } = await import('../index');
    const offers = await prisma.offer.findMany({
      include: {
        candidate: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(offers);
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ error: 'Failed to get offers' });
  }
});

/**
 * Get all onboardings
 */
router.get('/onboardings', async (req: Request, res: Response) => {
  try {
    const { prisma } = await import('../index');
    const onboardings = await prisma.onboarding.findMany({
      include: {
        candidate: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(onboardings);
  } catch (error) {
    console.error('Get onboardings error:', error);
    res.status(500).json({ error: 'Failed to get onboardings' });
  }
});

/**
 * Get all trainings
 */
router.get('/trainings', async (req: Request, res: Response) => {
  try {
    const { prisma } = await import('../index');
    const trainings = await prisma.training.findMany({
      include: {
        candidate: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(trainings);
  } catch (error) {
    console.error('Get trainings error:', error);
    res.status(500).json({ error: 'Failed to get trainings' });
  }
});

/**
 * Get all outsourcings
 */
router.get('/outsourcings', async (req: Request, res: Response) => {
  try {
    const { prisma } = await import('../index');
    const outsourcings = await prisma.outsourcing.findMany({
      include: {
        candidate: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(outsourcings);
  } catch (error) {
    console.error('Get outsourcings error:', error);
    res.status(500).json({ error: 'Failed to get outsourcings' });
  }
});

/**
 * Get workflow statistics
 */
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const { prisma } = await import('../index');

    const [
      totalInterviews,
      scheduledInterviews,
      totalOffers,
      pendingOffers,
      acceptedOffers,
      totalOnboardings,
      activeOnboardings,
      totalTrainings,
      activeTrainings,
      totalOutsourcings,
      activeOutsourcings
    ] = await Promise.all([
      prisma.interview.count(),
      prisma.interview.count({ where: { status: 'SCHEDULED' } }),
      prisma.offer.count(),
      prisma.offer.count({ where: { status: 'PENDING' } }),
      prisma.offer.count({ where: { status: 'ACCEPTED' } }),
      prisma.onboarding.count(),
      prisma.onboarding.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.training.count(),
      prisma.training.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.outsourcing.count(),
      prisma.outsourcing.count({ where: { status: 'ACTIVE' } })
    ]);

    res.json({
      interviews: { total: totalInterviews, scheduled: scheduledInterviews },
      offers: { total: totalOffers, pending: pendingOffers, accepted: acceptedOffers },
      onboardings: { total: totalOnboardings, active: activeOnboardings },
      trainings: { total: totalTrainings, active: activeTrainings },
      outsourcings: { total: totalOutsourcings, active: activeOutsourcings }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;
