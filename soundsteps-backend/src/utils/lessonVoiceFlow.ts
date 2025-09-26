import { handleCall, sendLessonSummary, sendAirtimeReward } from './africasTalking.js';

// Lesson state management
interface LessonSession {
  sessionId: string;
  phoneNumber: string;
  currentQuestionIndex: number;
  answers: number[];
  lessonId?: string;
  lessonTitle?: string;
  startTime: Date;
}

// In-memory session storage (in production, use Redis or database)
const sessions: Map<string, LessonSession> = new Map();

// Sample lesson data with text content for TTS (this would come from database)
const sampleLesson = {
  id: '1',
  title: 'Basic Mathematics',
  description: 'Learn basic addition, subtraction, and multiplication through interactive questions',
  textContent: `Welcome to today's mathematics lesson. 
    We will learn about basic arithmetic operations including addition, subtraction, and multiplication.
    Mathematics is the foundation of problem-solving and logical thinking.
    Today we will practice simple calculations that you encounter in everyday life.
    Let's start with some examples to make sure you understand the concepts.`,
  questions: [
    {
      question: 'What is 2 plus 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1 // Index 1 = option '4'
    },
    {
      question: 'What is 10 minus 5?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 2 // Index 2 = option '5'
    },
    {
      question: 'What is 3 times 3?',
      options: ['6', '8', '9', '12'],
      correctAnswer: 2 // Index 2 = option '9'
    }
  ]
};

/**
 * Advanced voice call handler with lesson flow management
 */
export async function handleLessonCall(
  sessionId: string,
  phoneNumber: string,
  isActive: string,
  dtmfDigits?: string,
  direction?: string
): Promise<string> {
  try {
    console.log('🎓 Handling lesson call:', { sessionId, phoneNumber, isActive, dtmfDigits, direction });

    // Call session ended - process results
    if (isActive === '0') {
      const session = sessions.get(sessionId);
      if (session) {
        await processLessonCompletion(session);
        sessions.delete(sessionId);
      }
      return '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
    }

    let session = sessions.get(sessionId);

    // New call - initialize session
    if (!session && (!dtmfDigits || direction === 'inbound')) {
      session = {
        sessionId,
        phoneNumber,
        currentQuestionIndex: -1, // Start before first question
        answers: [],
        lessonId: sampleLesson.id,
        lessonTitle: sampleLesson.title,
        startTime: new Date()
      };
      sessions.set(sessionId, session);

      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Welcome to SoundSteps! You are about to start the lesson: ${sampleLesson.title}</Say>
    <Say>${sampleLesson.description}</Say>
    <Pause length="1"/>
    <Say>${sampleLesson.textContent}</Say>
    <Pause length="2"/>
    <Say>Now let's test your understanding with ${sampleLesson.questions.length} quiz questions. Listen carefully and answer using your phone keypad.</Say>
    <Pause length="1"/>
    <Say>Let's begin with the first question.</Say>
    <GetDigits numDigits="1" timeout="15" finishOnKey="" callbackUrl="${process.env.BASE_URL}/webhooks/voice/dtmf">
        <Say>${sampleLesson.questions[0].question}. Press 1 for ${sampleLesson.questions[0].options[0]}, 2 for ${sampleLesson.questions[0].options[1]}, 3 for ${sampleLesson.questions[0].options[2]}, or 4 for ${sampleLesson.questions[0].options[3]}</Say>
    </GetDigits>
</Response>`;
    }

    // Handle DTMF response (quiz answer)
    if (dtmfDigits && session) {
      const answerIndex = parseInt(dtmfDigits) - 1; // Convert 1-4 to 0-3
      
      if (answerIndex >= 0 && answerIndex < 4) {
        session.answers.push(answerIndex);
        session.currentQuestionIndex++;

        // Check if more questions remaining
        if (session.currentQuestionIndex < sampleLesson.questions.length - 1) {
          const nextQuestion = sampleLesson.questions[session.currentQuestionIndex + 1];
          
          return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Thank you for your answer. Here's the next question.</Say>
    <GetDigits numDigits="1" timeout="15" finishOnKey="" callbackUrl="${process.env.BASE_URL}/webhooks/voice/dtmf">
        <Say>${nextQuestion.question}. Press 1 for ${nextQuestion.options[0]}, 2 for ${nextQuestion.options[1]}, 3 for ${nextQuestion.options[2]}, or 4 for ${nextQuestion.options[3]}</Say>
    </GetDigits>
</Response>`;
        } else {
          // All questions answered - end lesson
          const score = calculateScore(session.answers);
          const percentage = Math.round((score / sampleLesson.questions.length) * 100);
          
          return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Congratulations! You have completed the lesson ${session.lessonTitle}.</Say>
    <Say>Your score is ${score} out of ${sampleLesson.questions.length}, which is ${percentage} percent.</Say>
    <Say>${percentage >= 70 ? 'Excellent work! You passed the lesson.' : 'Keep practicing! You can try again anytime.'}</Say>
    <Say>A summary will be sent to your caregiver. Thank you for using SoundSteps!</Say>
</Response>`;
        }
      } else {
        // Invalid input
        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Sorry, that's not a valid option. Please press a number from 1 to 4.</Say>
    <GetDigits numDigits="1" timeout="15" finishOnKey="" callbackUrl="${process.env.BASE_URL}/webhooks/voice/dtmf">
        <Say>Please try again with your answer.</Say>
    </GetDigits>
</Response>`;
      }
    }

    // Fallback response
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Thank you for calling SoundSteps. Goodbye!</Say>
</Response>`;
    
  } catch (error) {
    console.error('❌ Lesson call handling failed:', error);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>We're sorry, there was an error during your lesson. Please try calling again.</Say>
</Response>`;
  }
}

/**
 * Calculate quiz score
 */
function calculateScore(answers: number[]): number {
  let score = 0;
  for (let i = 0; i < answers.length && i < sampleLesson.questions.length; i++) {
    if (answers[i] === sampleLesson.questions[i].correctAnswer) {
      score++;
    }
  }
  return score;
}

/**
 * Process lesson completion - send summary and rewards
 */
async function processLessonCompletion(session: LessonSession): Promise<void> {
  try {
    const score = calculateScore(session.answers);
    const totalQuestions = sampleLesson.questions.length;

    console.log('🎯 Processing lesson completion:', {
      sessionId: session.sessionId,
      phoneNumber: session.phoneNumber,
      score,
      totalQuestions,
      duration: Date.now() - session.startTime.getTime()
    });

    // Send lesson summary to caregiver (mock caregiver phone)
    const caregiverPhone = '+254700000000'; // In real app, get from user profile
    
    await sendLessonSummary(
      caregiverPhone,
      'Student', // In real app, get student name
      session.lessonTitle || 'Lesson',
      score,
      totalQuestions,
      'en' // Language preference from user profile
    );

    // Send airtime reward based on performance
    if (score >= totalQuestions * 0.5) { // 50% minimum for reward
      await sendAirtimeReward(
        session.phoneNumber,
        score,
        totalQuestions,
        'student'
      );

      // Also reward caregiver for supporting
      await sendAirtimeReward(
        caregiverPhone,
        score,
        totalQuestions,
        'caregiver'
      );
    }

  } catch (error) {
    console.error('❌ Failed to process lesson completion:', error);
  }
}

export default {
  handleLessonCall,
  sessions // Export for testing/debugging
};