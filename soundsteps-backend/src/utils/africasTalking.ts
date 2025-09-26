import africastalking from 'africastalking';

const username = process.env.AT_USERNAME || '';
const apiKey = process.env.AT_API_KEY || '';

// Initialize Africa's Talking client only if credentials are provided
let AT: any = null;

if (username && apiKey) {
  AT = africastalking({ username, apiKey });
  console.log('📱 Africa\'s Talking client initialized');
} else {
  console.warn('⚠️ Africa\'s Talking credentials not configured - using mock mode');
}


export async function sendSMS(to: string, message: string): Promise<any> {
  try {
    if (!AT) {
      console.log('📱 Mock SMS send to', to, ':', message.substring(0, 50) + '...');
      return { success: true, mock: true, message: 'SMS sent in mock mode' };
    }
    
    const response = await AT.SMS.send({
      to,
      message,
      from: process.env.AT_SENDER_ID || undefined
    });
    
    console.log('📱 SMS sent:', { to, message: message.substring(0, 50) + '...', response });
    return response;
  } catch (error) {
    console.error('❌ SMS failed:', error);
    throw error;
  }
}

/**
 * Send lesson summary to caregiver in both English and Swahili
 */
export async function sendLessonSummary(
  phoneNumber: string,
  learnerName: string,
  lessonTitle: string,
  score: number,
  totalQuestions: number,
  language: 'en' | 'sw' = 'en'
): Promise<any> {
  const messages = {
    en: `📚 SoundSteps Lesson Update

Student: ${learnerName}
Lesson: ${lessonTitle}
Quiz Score: ${score}/${totalQuestions} (${Math.round((score/totalQuestions) * 100)}%)

${score >= totalQuestions * 0.7 ? '🎉 Great job! Your student passed!' : '📖 Encourage your student to try again.'}

For more details, check the SoundSteps app.`,

    sw: `📚 SoundSteps Ripoti ya Somo

Mwanafunzi: ${learnerName}
Somo: ${lessonTitle}
Alama: ${score}/${totalQuestions} (${Math.round((score/totalQuestions) * 100)}%)

${score >= totalQuestions * 0.7 ? '🎉 Vizuri sana! Mwanafunzi wako amefaulu!' : '📖 Himiza mwanafunzi wako ajaribu tena.'}

Kwa maelezo zaidi, angalia programu ya SoundSteps.`
  };

  return sendSMS(phoneNumber, messages[language]);
}

export async function handleCall(
  sessionId: string,
  phoneNumber: string,
  isActive: string,
  dtmfDigits?: string,
  direction?: string
): Promise<string> {
  try {
    console.log('📞 Handling voice call:', { sessionId, phoneNumber, isActive, dtmfDigits, direction });

    // Call session ended
    if (isActive === '0') {
      console.log('📞 Call session ended for:', sessionId);
      return '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
    }

    // Handle DTMF response (quiz answer)
    if (dtmfDigits) {
      console.log('🔢 DTMF received:', dtmfDigits, 'for session:', sessionId);
      
      // Process quiz answer logic here
      // This would integrate with your lesson flow system
      
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Thank you for your answer. Processing next question...</Say>
    <GetDigits numDigits="1" timeout="10" finishOnKey="" callbackUrl="${process.env.BASE_URL}/webhooks/voice/dtmf">
        <Say>Press 1 for option A, 2 for option B, 3 for option C, or 4 for option D</Say>
    </GetDigits>
</Response>`;
    }

    // Initial call - start lesson with text-to-speech content
    if (direction === 'inbound' || !dtmfDigits) {
      console.log('🎓 Starting new lesson for:', phoneNumber);
      
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Welcome to SoundSteps! You are about to start a lesson delivered through text-to-speech.</Say>
    <Say>This is an interactive educational platform where you learn by listening and responding with your phone keypad.</Say>
    <Pause length="2"/>
    <Say>Here is today's lesson content: Mathematics is all around us in our daily lives. We use numbers to count money, measure ingredients for cooking, and calculate time. Today we will practice basic arithmetic that will help you solve real-world problems.</Say>
    <Pause length="1"/>
    <Say>Now let's test your understanding with some questions.</Say>
    <GetDigits numDigits="1" timeout="15" finishOnKey="" callbackUrl="${process.env.BASE_URL}/webhooks/voice/dtmf">
        <Say>Press 1 to continue with the lesson, or 2 to end the call</Say>
    </GetDigits>
</Response>`;
    }

    // Default fallback
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Thank you for calling SoundSteps. Goodbye!</Say>
</Response>`;
    
  } catch (error) {
    console.error('❌ Voice call handling failed:', error);
    
    // Return error response XML
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>We're sorry, there was an error processing your call. Please try again later.</Say>
</Response>`;
  }
}

/**
 * Make outbound call to initiate lesson
 */
export async function makeCall(to: string, from?: string): Promise<any> {
  try {
    if (!AT) {
      console.log('📞 Mock call initiation to', to, 'from', from);
      return { success: true, mock: true, message: 'Call initiated in mock mode' };
    }
    
    const response = await AT.VOICE.call({
      callTo: to,
      callFrom: from || process.env.AT_VOICE_NUMBER || '',
    });
    
    console.log('📞 Call initiated:', { to, response });
    return response;
  } catch (error) {
    console.error('❌ Call failed:', error);
    throw error;
  }
}

export async function sendAirtime(phoneNumber: string, amount: string): Promise<any> {
  try {
    if (!AT) {
      console.log('💰 Mock airtime send to', phoneNumber, 'amount:', amount);
      return { success: true, mock: true, message: 'Airtime sent in mock mode' };
    }
    
    const response = await AT.AIRTIME.send({
      recipients: [
        {
          phoneNumber,
          currencyCode: 'KES',
          amount
        }
      ]
    });
    
    console.log('💰 Airtime sent:', { phoneNumber, amount, response });
    return response;
  } catch (error) {
    console.error('❌ Airtime failed:', error);
    throw error;
  }
}

/**
 * Send airtime reward for lesson completion
 */
export async function sendAirtimeReward(
  phoneNumber: string,
  score: number,
  totalQuestions: number,
  rewardType: 'student' | 'caregiver' = 'student'
): Promise<any> {
  try {
    // Calculate reward amount based on performance
    const percentage = (score / totalQuestions) * 100;
    let rewardAmount = '0';

    if (percentage >= 90) {
      rewardAmount = rewardType === 'student' ? '10' : '5'; // KES 10 for student, 5 for caregiver
    } else if (percentage >= 70) {
      rewardAmount = rewardType === 'student' ? '5' : '2'; // KES 5 for student, 2 for caregiver
    } else if (percentage >= 50) {
      rewardAmount = rewardType === 'student' ? '2' : '1'; // KES 2 for student, 1 for caregiver
    }

    if (rewardAmount === '0') {
      console.log('💰 No reward for performance below 50%');
      return { success: false, message: 'Score too low for reward' };
    }

    const response = await sendAirtime(phoneNumber, rewardAmount);

    // Send confirmation SMS
    const confirmationMessage = `🎉 Congratulations! You've earned KES ${rewardAmount} airtime for ${rewardType === 'student' ? 'completing' : 'supporting'} your SoundSteps lesson. Keep learning!`;
    await sendSMS(phoneNumber, confirmationMessage);

    return response;
  } catch (error) {
    console.error('❌ Airtime reward failed:', error);
    throw error;
  }
}


export default {
  SMS: AT?.SMS || null,
  VOICE: AT?.VOICE || null,
  AIRTIME: AT?.AIRTIME || null,
  sendSMS,
  sendLessonSummary,
  makeCall,
  handleCall,
  sendAirtime,
  sendAirtimeReward
};