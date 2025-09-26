import { Router, Request, Response } from 'express';
import { getDb } from '../../utils/database.js';
import { flow, buildVoiceResponse } from '../../utils/lessonFlow.js';
import { sendSMS, handleCall, sendLessonSummary, sendAirtimeReward } from '../../utils/africasTalking.js';
import { handleLessonCall } from '../../utils/lessonVoiceFlow.js';
import { prepareLessonForVoice, generateLessonIntroXML, generateQuizQuestionXML, generateLessonCompletionXML } from '../../utils/lessonVoiceTTS.js';

const router = Router();

// Simple voice handler using the new handleCall function
router.post('/voice-simple', async (req: Request, res: Response) => {
  try {
    const { 
      sessionId, 
      phoneNumber, 
      isActive, 
      dtmfDigits, 
      direction 
    } = req.body;

    console.log('🎙️ Simple voice webhook received:', { 
      sessionId, 
      phoneNumber, 
      isActive, 
      dtmfDigits, 
      direction 
    });

    // Use our new handleCall function
    const xmlResponse = await handleCall(
      sessionId, 
      phoneNumber, 
      isActive, 
      dtmfDigits, 
      direction
    );

    console.log('📤 Sending XML response:', xmlResponse);
    res.set('Content-Type', 'application/xml');
    res.send(xmlResponse);

  } catch (error) {
    console.error('❌ Voice simple webhook error:', error);
    
    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>We're sorry, there was an error. Please try again later.</Say>
</Response>`;
    
    res.set('Content-Type', 'application/xml');
    res.send(errorResponse);
  }
});

// DTMF handler for quiz interactions
router.post('/dtmf', async (req: DTMFRequest, res: Response) => {
  try {
    const { sessionId, phoneNumber, dtmfDigits } = req.body;

    console.log('🔢 DTMF webhook received:', { sessionId, phoneNumber, dtmfDigits });

    // Process the DTMF input as a quiz answer
    const xmlResponse = await handleCall(
      sessionId,
      phoneNumber,
      '1', // Active call
      dtmfDigits
    );

    console.log('📤 Sending DTMF response:', xmlResponse);
    res.set('Content-Type', 'application/xml');
    res.send(xmlResponse);

  } catch (error) {
    console.error('❌ DTMF webhook error:', error);
    
    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>We're sorry, there was an error processing your answer. Please try again.</Say>
</Response>`;
    
    res.set('Content-Type', 'application/xml');
    res.send(errorResponse);
  }
});

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

// Advanced lesson flow handler
router.post('/lesson', async (req: Request, res: Response) => {
  try {
    const { 
      sessionId, 
      phoneNumber, 
      isActive, 
      dtmfDigits, 
      direction 
    } = req.body;

    console.log('🎓 Advanced lesson webhook received:', { 
      sessionId, 
      phoneNumber, 
      isActive, 
      dtmfDigits, 
      direction 
    });

    // Use our advanced lesson call handler
    const xmlResponse = await handleLessonCall(
      sessionId, 
      phoneNumber, 
      isActive, 
      dtmfDigits, 
      direction
    );

    console.log('📤 Sending lesson XML response:', xmlResponse);
    res.set('Content-Type', 'application/xml');
    res.send(xmlResponse);

  } catch (error) {
    console.error('❌ Advanced lesson webhook error:', error);
    
    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>We're sorry, there was an error with your lesson. Please try calling again.</Say>
</Response>`;
    
    res.set('Content-Type', 'application/xml');
    res.send(errorResponse);
  }
});

// Text-to-Speech lesson handler using database content
router.post('/tts-lesson', async (req: Request, res: Response) => {
  try {
    const { 
      sessionId, 
      phoneNumber, 
      isActive, 
      dtmfDigits, 
      direction 
    } = req.body;

    console.log('🗣️ TTS lesson webhook received:', { 
      sessionId, 
      phoneNumber, 
      isActive, 
      dtmfDigits, 
      direction 
    });

    // Call session ended
    if (isActive === '0') {
      console.log('📞 TTS lesson call ended for session:', sessionId);
      return res.set('Content-Type', 'application/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    // Initial call - introduce lesson using TTS
    if (!dtmfDigits || direction === 'inbound') {
      // Use default lesson for demo (in production, get lessonId from call context)
      const lessonId = 'basic-addition-001'; // This would come from session or caller context
      
      try {
        const voiceContent = await prepareLessonForVoice(lessonId);
        const xmlResponse = generateLessonIntroXML(voiceContent, baseUrl);
        
        console.log('📤 Sending TTS lesson intro:', xmlResponse);
        return res.set('Content-Type', 'application/xml').send(xmlResponse);
      } catch (error) {
        console.error('❌ Error preparing lesson for voice:', error);
        
        // Fallback to generic lesson intro
        const fallbackResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Welcome to SoundSteps! We will start your lesson now using our text-to-speech system.</Say>
    <Say>This is an interactive educational platform. Listen carefully and respond using your phone keypad.</Say>
    <Say>Today's lesson will help you learn new concepts through voice interaction.</Say>
    <GetDigits numDigits="1" timeout="15" finishOnKey="" callbackUrl="${baseUrl}/webhooks/voice/tts-lesson">
        <Say>Press 1 to continue, or 9 to end the call</Say>
    </GetDigits>
</Response>`;
        
        return res.set('Content-Type', 'application/xml').send(fallbackResponse);
      }
    }

    // Handle user input
    if (dtmfDigits === '1') {
      const continueResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Excellent! Let's continue with your lesson.</Say>
    <Say>Mathematics is everywhere in our daily lives. We use it for shopping, cooking, and time management.</Say>
    <Say>Today we will practice basic calculations that will help you in real situations.</Say>
    <Pause length="2"/>
    <Say>Let's start with a simple question to test your understanding.</Say>
    <GetDigits numDigits="1" timeout="20" finishOnKey="" callbackUrl="${baseUrl}/webhooks/voice/tts-lesson">
        <Say>What is 2 plus 3? Press 1 for 4, 2 for 5, 3 for 6, or 4 for 7</Say>
    </GetDigits>
</Response>`;
      
      return res.set('Content-Type', 'application/xml').send(continueResponse);
    }

    if (dtmfDigits === '2') {
      const correctResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Correct! 2 plus 3 equals 5. Well done!</Say>
    <Say>Let's try another question.</Say>
    <GetDigits numDigits="1" timeout="20" finishOnKey="" callbackUrl="${baseUrl}/webhooks/voice/tts-lesson">
        <Say>What is 10 minus 4? Press 1 for 5, 2 for 6, 3 for 7, or 4 for 8</Say>
    </GetDigits>
</Response>`;
      
      return res.set('Content-Type', 'application/xml').send(correctResponse);
    }

    if (dtmfDigits === '9') {
      const endResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Thank you for using SoundSteps! Your lesson progress has been saved.</Say>
    <Say>Keep learning and have a great day!</Say>
</Response>`;
      
      return res.set('Content-Type', 'application/xml').send(endResponse);
    }

    // Default response for other inputs
    const defaultResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>I didn't understand that response. Let me repeat the question.</Say>
    <GetDigits numDigits="1" timeout="15" finishOnKey="" callbackUrl="${baseUrl}/webhooks/voice/tts-lesson">
        <Say>Press a number from 1 to 4 to answer, or 9 to end the call</Say>
    </GetDigits>
</Response>`;
    
    res.set('Content-Type', 'application/xml').send(defaultResponse);

  } catch (error) {
    console.error('❌ TTS lesson webhook error:', error);
    
    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>We're sorry, there was a technical error. Please try calling again later.</Say>
</Response>`;
    
    res.set('Content-Type', 'application/xml');
    res.send(errorResponse);
  }
});

export { router as voiceRouter };