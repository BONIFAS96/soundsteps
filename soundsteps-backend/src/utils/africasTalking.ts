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

export default {
  SMS: AT?.SMS || null,
  VOICE: AT?.VOICE || null,
  AIRTIME: AT?.AIRTIME || null,
  sendSMS,
  makeCall,
  sendAirtime
};