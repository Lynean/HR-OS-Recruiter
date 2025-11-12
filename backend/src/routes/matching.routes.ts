import { Router, Request, Response } from 'express';
import matchingService from '../services/matching.service';

const router = Router();

/**
 * Match candidate with job description
 */
router.post('/score', async (req: Request, res: Response) => {
  try {
    const { candidateId, jobDescriptionId } = req.body;

    if (!candidateId || !jobDescriptionId) {
      return res.status(400).json({ error: 'candidateId and jobDescriptionId are required' });
    }

    const match = await matchingService.matchCandidateWithJD(candidateId, jobDescriptionId);
    res.json(match);
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({ error: 'Failed to match candidate with job description' });
  }
});

/**
 * Get top candidates for a job description
 */
router.get('/candidates/:jdId', async (req: Request, res: Response) => {
  try {
    const { jdId } = req.params;
    const { limit, minScore } = req.query;

    const matches = await matchingService.getTopCandidatesForJD(
      jdId,
      limit ? parseInt(limit as string) : 10,
      minScore ? parseFloat(minScore as string) : 60
    );

    res.json(matches);
  } catch (error) {
    console.error('Get top candidates error:', error);
    res.status(500).json({ error: 'Failed to get top candidates' });
  }
});

/**
 * Batch match all candidates with a job description
 */
router.post('/batch/:jdId', async (req: Request, res: Response) => {
  try {
    const { jdId } = req.params;

    const matches = await matchingService.batchMatchCandidates(jdId);
    res.json({ matches, total: matches.length });
  } catch (error) {
    console.error('Batch matching error:', error);
    res.status(500).json({ error: 'Failed to batch match candidates' });
  }
});

export default router;
