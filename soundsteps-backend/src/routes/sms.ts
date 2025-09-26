import { Router, Request, Response } from 'express';
import { getDb } from '../utils/database.js';
import { sendSMS, sendLessonSummary } from '../utils/africasTalking.js';

const router = Router();

interface Student {
  id: string;
  name: string;
  phone: string;
  caregiver_phone?: string;
  current_lesson_id?: string;
  current_question_index?: number;
  current_score?: number;
  answers?: string;
}

interface SMSQuizSession {
  studentId: string;
  lessonId: string;
  questionIndex: number;
  score: number;
  answers: string[];
  startTime: Date;
}

const activeSessions = new Map<string, SMSQuizSession>();

/**
 * Start SMS lesson for a student
 * POST /api/sms/start-lesson
 */
router.post('/start-lesson', async (req: Request, res: Response) => {
  try {
    const { studentPhone, lessonId, studentName = 'Student' } = req.body;

    if (!studentPhone || !lessonId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student phone and lesson ID required' 
      });
    }

    const db = getDb();
    
    // Get lesson with quiz questions
    const lesson = await db.get(`
      SELECT l.*, GROUP_CONCAT(
        json_object(
          'question', qq.question,
          'options', qq.options,
          'correct_answer', qq.correct_answer
        )
      ) as quiz_questions
      FROM lessons l
      LEFT JOIN quiz_questions qq ON l.id = qq.lesson_id
      WHERE l.id = ?
      GROUP BY l.id
    `, lessonId) as any;

    if (!lesson) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lesson not found' 
      });
    }

    // Parse quiz questions
    let questions = [];
    if (lesson.quiz_questions) {
      questions = lesson.quiz_questions.split(',').map((q: string) => JSON.parse(q));
    }

    if (questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lesson has no quiz questions' 
      });
    }

    // Create SMS session
    const session: SMSQuizSession = {
      studentId: studentPhone, // Using phone as ID for SMS
      lessonId,
      questionIndex: 0,
      score: 0,
      answers: [],
      startTime: new Date()
    };
    
    activeSessions.set(studentPhone, session);

    // Send lesson introduction
    const introMessage = `📚 ${lesson.title}

${lesson.content?.substring(0, 160) || 'Welcome to your lesson!'}

Starting quiz now...`;

    await sendSMS(studentPhone, introMessage);

    // Send first question after a short delay
    setTimeout(async () => {
      await sendQuizQuestion(studentPhone, questions[0], 1, questions.length);
    }, 2000);

    // Save session to database
    await db.run(`
      INSERT OR REPLACE INTO sms_sessions 
      (phone, lesson_id, question_index, score, answers, status, start_time)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `, studentPhone, lessonId, 0, 0, JSON.stringify([]), 'IN_PROGRESS');

    console.log('📱 SMS lesson started for:', studentPhone, 'Lesson:', lesson.title);

    res.json({ 
      success: true, 
      message: 'SMS lesson started successfully',
      sessionId: studentPhone,
      totalQuestions: questions.length
    });

  } catch (error) {
    console.error('❌ Error starting SMS lesson:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start SMS lesson' 
    });
  }
});

/**
 * Handle incoming SMS responses (webhook from Africa's Talking)
 * POST /api/sms/webhook
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { from, text, to, id } = req.body;
    
    console.log('📨 SMS webhook received:', { from, text, to, id });

    const session = activeSessions.get(from);
    if (!session) {
      // Send help message for unknown sessions
      await sendSMS(from, '❓ No active lesson found. Contact your teacher to start a lesson.');
      return res.json({ success: true, message: 'No active session' });
    }

    const db = getDb();
    
    // Get current lesson and questions
    const lesson = await db.get(`
      SELECT l.*, GROUP_CONCAT(
        json_object(
          'question', qq.question,
          'options', qq.options,
          'correct_answer', qq.correct_answer
        )
      ) as quiz_questions
      FROM lessons l
      LEFT JOIN quiz_questions qq ON l.id = qq.lesson_id
      WHERE l.id = ?
      GROUP BY l.id
    `, session.lessonId) as any;

    const questions = lesson.quiz_questions.split(',').map((q: string) => JSON.parse(q));
    const currentQuestion = questions[session.questionIndex];

    // Parse answer (A, B, C, D or 1, 2, 3, 4)
    let answer = text.trim().toUpperCase();
    if (['1', '2', '3', '4'].includes(answer)) {
      answer = ['A', 'B', 'C', 'D'][parseInt(answer) - 1];
    }

    // Validate answer
    if (!['A', 'B', 'C', 'D'].includes(answer)) {
      await sendSMS(from, '❌ Please reply with A, B, C, D or 1, 2, 3, 4');
      return res.json({ success: true, message: 'Invalid answer format' });
    }

    // Check if answer is correct
    const isCorrect = answer === currentQuestion.correct_answer;
    if (isCorrect) {
      session.score++;
    }
    session.answers.push(answer);

    // Send feedback
    const feedback = isCorrect ? '✅ Correct!' : `❌ Wrong. Answer: ${currentQuestion.correct_answer}`;
    await sendSMS(from, feedback);

    // Move to next question or finish lesson
    session.questionIndex++;
    
    if (session.questionIndex >= questions.length) {
      // Lesson completed
      await completeSMSLesson(from, session, lesson);
      activeSessions.delete(from);
    } else {
      // Send next question
      const nextQuestion = questions[session.questionIndex];
      await sendQuizQuestion(from, nextQuestion, session.questionIndex + 1, questions.length);
    }

    // Update session in database
    await db.run(`
      UPDATE sms_sessions 
      SET question_index = ?, score = ?, answers = ?
      WHERE phone = ?
    `, session.questionIndex, session.score, JSON.stringify(session.answers), from);

    res.json({ success: true, message: 'SMS processed successfully' });

  } catch (error) {
    console.error('❌ Error processing SMS webhook:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process SMS' 
    });
  }
});

/**
 * Get SMS lesson progress for teacher dashboard
 * GET /api/sms/progress/:phone
 */
router.get('/progress/:phone', async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    const db = getDb();

    const session = await db.get(`
      SELECT ss.*, l.title as lesson_title
      FROM sms_sessions ss
      LEFT JOIN lessons l ON ss.lesson_id = l.id
      WHERE ss.phone = ?
      ORDER BY ss.start_time DESC
      LIMIT 1
    `, phone) as any;

    if (!session) {
      return res.json({ 
        success: false, 
        message: 'No SMS session found' 
      });
    }

    const progress = {
      phone,
      lessonTitle: session.lesson_title,
      currentQuestion: session.question_index + 1,
      score: session.score,
      status: session.status,
      answers: JSON.parse(session.answers || '[]'),
      startTime: session.start_time
    };

    res.json({ success: true, progress });

  } catch (error) {
    console.error('❌ Error getting SMS progress:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get progress' 
    });
  }
});

/**
 * Send quiz question via SMS
 */
async function sendQuizQuestion(
  phone: string, 
  question: any, 
  questionNum: number, 
  totalQuestions: number
): Promise<void> {
  const options = JSON.parse(question.options);
  
  const message = `❓ Question ${questionNum}/${totalQuestions}

${question.question}

A) ${options[0]}
B) ${options[1]}
C) ${options[2]}
D) ${options[3]}

Reply A, B, C or D`;

  await sendSMS(phone, message);
}

/**
 * Complete SMS lesson and send summary
 */
async function completeSMSLesson(
  phone: string, 
  session: SMSQuizSession, 
  lesson: any
): Promise<void> {
  const db = getDb();
  const totalQuestions = session.answers.length;
  const percentage = Math.round((session.score / totalQuestions) * 100);
  
  // Send completion message to student
  const completionMessage = `🎉 Lesson Complete!

📚 ${lesson.title}
📊 Final Score: ${session.score}/${totalQuestions} (${percentage}%)

${percentage >= 70 ? '🌟 Excellent work! You passed!' : '📖 Keep studying and try again!'}

Thank you for using SoundSteps! 📱`;

  await sendSMS(phone, completionMessage);

  // Get student info for caregiver SMS
  const student = await db.get(`
    SELECT * FROM students WHERE phone = ?
  `, phone) as any;

  // Send summary to caregiver if available
  if (student?.caregiver_phone) {
    await sendLessonSummary(
      student.caregiver_phone,
      student.name || 'Student',
      lesson.title,
      session.score,
      totalQuestions,
      'en' // Could be dynamic based on student preference
    );
  }

  // Update final session status
  await db.run(`
    UPDATE sms_sessions 
    SET status = 'COMPLETED', end_time = datetime('now')
    WHERE phone = ?
  `, phone);

  console.log('📱 SMS lesson completed for:', phone, 'Score:', `${session.score}/${totalQuestions}`);
}

/**
 * Demo endpoint - simulate SMS lesson for presentation
 * POST /api/sms/demo
 */
router.post('/demo', async (req: Request, res: Response) => {
  try {
    const { demoPhone = '+254712345678' } = req.body;
    
    // Create a demo lesson
    const demoLessonId = 'demo-math-001';
    
    // Start the demo lesson
    const startResponse = await fetch(`${req.protocol}://${req.get('host')}/api/sms/start-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentPhone: demoPhone,
        lessonId: demoLessonId,
        studentName: 'Grace (Demo)'
      })
    });

    const result = await startResponse.json();
    
    res.json({
      success: true,
      message: 'Demo SMS lesson started',
      demoPhone,
      ...result
    });

  } catch (error) {
    console.error('❌ Error starting demo SMS lesson:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start demo' 
    });
  }
});

export { router as smsRouter };