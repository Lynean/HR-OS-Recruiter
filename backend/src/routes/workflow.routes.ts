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

export default router;
