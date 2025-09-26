import express, { Request, Response } from 'express';
import { getRecentSessions } from '../models/Session';
import { makeCall, sendLessonSummary, sendAirtimeReward } from '../utils/africasTalking';
import { AuthRequest } from '../utils/auth';

const router = express.Router();

/**
 * GET /sessions - Fetch recent call sessions
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const sessions = await getRecentSessions(limit);
    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/**
 * GET /sessions/stats - Get dashboard statistics
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Implement proper stats calculation
    const sessions = await getRecentSessions(100);
    
    const stats = {
      totalCalls: sessions.length,
      completedCalls: sessions.filter(s => s.status === 'COMPLETED').length,
      averageScore: sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length || 0,
      activeCalls: sessions.filter(s => s.status === 'IN_PROGRESS').length
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * POST /sessions/outbound-call - Trigger outbound call to learner
 */
router.post('/outbound-call', async (req: AuthRequest, res: Response) => {
  try {
    const { phoneNumber, lessonId } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Trigger Africa's Talking voice call
    const callResponse = await makeCall(phoneNumber);
    
    // Emit to dashboard
    const io = req.app.get('io');
    io.emit('outbound-call-initiated', { 
      phoneNumber, 
      lessonId: lessonId || 'basic-addition-001',
      response: callResponse 
    });
    
    res.json({ 
      success: true, 
      message: 'Outbound call initiated',
      callResponse 
    });
  } catch (error) {
    console.error('Outbound call error:', error);
    res.status(500).json({ error: 'Failed to initiate call' });
  }
});

export default router;