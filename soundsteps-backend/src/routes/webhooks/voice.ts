import { Router, Request, Response } from 'express';
import { getDb } from '../../utils/database.js';
import { flow, buildVoiceResponse } from '../../utils/lessonFlow.js';
import { sendSMS } from '../../utils/africasTalking.js';

const router = Router();

interface VoiceCallRequest extends Request {
  body: {
    sessionId: string;
    phoneNumber: string;
    callId?: string;
    callerNumber?: string;
    direction?: string;
    isActive?: string;
  };
}

interface DTMFRequest extends Request {
  body: {
    sessionId: string;
    phoneNumber: string;
    dtmfDigits: string;
    callId?: string;
  };
}

// Core session management
interface VoiceSession {
  id: string;
  callId: string;
  callerPhone: string;
  answers: string[];
  score: number;
  caregiverPhone?: string;
  status: string;
  currentState: string;
}

async function getOrCreateSession(callId: string, phone: string): Promise<VoiceSession> {
  const db = getDb();
  
  // Check if session already exists
  const existingSession = await db.get(
    'SELECT * FROM sessions WHERE call_id = ? AND caller_phone = ?',
    callId, phone
  ) as any;
  
  if (existingSession) {
    return {
      id: existingSession.id,
      callId: existingSession.call_id,
      callerPhone: existingSession.caller_phone,
      answers: existingSession.answers ? JSON.parse(existingSession.answers) : [],
      score: existingSession.score || 0,
      caregiverPhone: existingSession.caregiver_phone,
      status: existingSession.status,
      currentState: existingSession.current_state || 'intro'
    };
  }
  
  // Create new session
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const session: VoiceSession = {
    id: sessionId,
    callId,
    callerPhone: phone,
    answers: [],
    score: 0,
    status: 'IN_PROGRESS',
    currentState: 'intro'
  };
  
  await db.run(`
    INSERT INTO sessions (id, call_id, caller_phone, lesson_id, answers, score, status, current_state, start_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `, sessionId, callId, phone, 'basic-addition-001', JSON.stringify([]), 0, 'IN_PROGRESS', 'intro');
  
  return session;
}

async function updateSession(session: VoiceSession): Promise<void> {
  const db = getDb();
  await db.run(`
    UPDATE sessions 
    SET answers = ?, score = ?, status = ?, current_state = ?, caregiver_phone = ?
    WHERE id = ?
  `,
    JSON.stringify(session.answers),
    session.score,
    session.status,
    session.currentState,
    session.caregiverPhone,
    session.id
  );
}

// Main voice webhook - called when call starts
router.post('/voice', async (req: VoiceCallRequest, res: Response) => {
  try {
    const { sessionId, phoneNumber, callId = sessionId, direction, isActive } = req.body;
    
    console.log('Voice webhook received:', { sessionId, phoneNumber, callId, direction, isActive });
    
    const session = await getOrCreateSession(callId, phoneNumber);
    console.log('Session state:', session.currentState);
    
    // Get current state from flow
    const currentFlow = flow[session.currentState];
    if (!currentFlow) {
      console.error(`Unknown state: ${session.currentState}`);
      return res.send(buildVoiceResponse('<Say>Sorry, there was an error. Please try again later.</Say><Hangup/>'));
    }
    
    let xmlContent = '';
    
    // If it's a gather state, use the prompt with gather
    if (currentFlow.gather) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      xmlContent = currentFlow.prompt(baseUrl, session);
    } else {
      // Non-gather state: say the prompt and move to next
      xmlContent = currentFlow.prompt();
      
      // Auto-advance to next state if specified
      if (currentFlow.next) {
        session.currentState = currentFlow.next;
        await updateSession(session);
      }
    }
    
    const response = buildVoiceResponse(xmlContent);
    console.log('Voice response:', response);
    res.send(response);
    
  } catch (error) {
    console.error('Voice webhook error:', error);
    res.send(buildVoiceResponse('<Say>Sorry, there was an error. Please try again later.</Say><Hangup/>'));
  }
});

// DTMF webhook - called when user presses keys
router.post('/dtmf', async (req: DTMFRequest, res: Response) => {
  try {
    const { sessionId, phoneNumber, dtmfDigits, callId = sessionId } = req.body;
    
    console.log('DTMF webhook received:', { sessionId, phoneNumber, dtmfDigits, callId });
    
    const session = await getOrCreateSession(callId, phoneNumber);
    const currentFlow = flow[session.currentState];
    
    if (!currentFlow || !currentFlow.onDigit) {
      console.error(`No digit handler for state: ${session.currentState}`);
      return res.send(buildVoiceResponse('<Say>Invalid input.</Say><Hangup/>'));
    }
    
    // Process the digit input
    const result = currentFlow.onDigit(dtmfDigits, session);
    
    // Update session state
    session.currentState = result.state;
    await updateSession(session);
    
    let xmlContent = '';
    
    // Add feedback if provided
    if (result.feedback) {
      xmlContent += result.feedback;
    }
    
    // Get the next flow state
    const nextFlow = flow[result.state];
    if (!nextFlow) {
      console.error(`Unknown next state: ${result.state}`);
      return res.send(buildVoiceResponse('<Say>Sorry, there was an error.</Say><Hangup/>'));
    }
    
    // Handle the next state
    if (nextFlow.gather) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      xmlContent += nextFlow.prompt(baseUrl, session);
    } else {
      xmlContent += nextFlow.prompt(undefined, session);
      
      // Auto-advance if there's a next state
      if (nextFlow.next) {
        session.currentState = nextFlow.next;
        await updateSession(session);
      }
    }
    
    // Handle special cases
    if (result.state === 'caregiverConfirm' && session.caregiverPhone) {
      // Send SMS summary
      try {
        const smsText = `SoundSteps Lesson Summary: Your child completed a Basic Addition lesson with a score of ${session.score}/2. Keep encouraging them to practice!`;
        await sendSMS(session.caregiverPhone, smsText);
        console.log(`SMS sent to caregiver: ${session.caregiverPhone}`);
      } catch (smsError) {
        console.error('Failed to send SMS:', smsError);
      }
    }
    
    if (result.state === 'end') {
      session.status = 'completed';
      await updateSession(session);
    }
    
    const response = buildVoiceResponse(xmlContent);
    console.log('DTMF response:', response);
    res.send(response);
    
  } catch (error) {
    console.error('DTMF webhook error:', error);
    res.send(buildVoiceResponse('<Say>Sorry, there was an error.</Say><Hangup/>'));
  }
});

// Call status webhook - optional for monitoring
router.post('/status', async (req: Request, res: Response) => {
  try {
    console.log('Call status update:', req.body);
    
    const { callId, phoneNumber, status } = req.body;
    
    if (status === 'Completed' || status === 'Failed') {
      // Update session status
      const db = getDb();
      await db.run(`
        UPDATE sessions 
        SET status = ?, end_time = datetime('now')
        WHERE call_id = ? AND caller_phone = ?
      `, status.toLowerCase(), callId, phoneNumber);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Call status webhook error:', error);
    res.json({ success: false, error: String(error) });
  }
});

export { router as voiceRouter };