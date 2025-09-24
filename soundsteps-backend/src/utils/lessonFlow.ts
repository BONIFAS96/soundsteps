// IVR lesson flow definition following the PRD script
// TypeScript version of the lesson flow from soundsteps/src/utils/lessonFlow.js

export const LESSON_ID = 'basic-addition-001';

// Utility to build a Voice response for Africa's Talking
function say(text: string): string {
  return `<Say>${text}</Say>`;
}

interface GatherOptions {
  timeout?: number;
  numDigits?: number;
  finishOnKey?: string;
}

function gather(baseUrl: string, text: string, opts: GatherOptions = {}): string {
  const timeout = opts.timeout ?? 6;
  const numDigits = opts.numDigits ?? 1;
  const finishOnKey = opts.finishOnKey ? ` finishOnKey="${opts.finishOnKey}"` : '';
  const callbackUrl = `${baseUrl.replace(/\/$/, '')}/webhooks/voice/dtmf`;
  return `${say(text)}<GetDigits timeout="${timeout}"${finishOnKey} callbackUrl="${callbackUrl}"${
    numDigits ? ` numDigits="${numDigits}"` : ''
  }><Say>Enter your choice now.</Say></GetDigits>`;
}

interface VoiceSession {
  id: string;
  callId: string;
  callerPhone: string;
  answers: string[];
  score: number;
  caregiverPhone?: string;
  status: string;
}

interface StateResult {
  state: string;
  feedback?: string;
}

interface FlowState {
  prompt: (baseUrl?: string, session?: VoiceSession) => string;
  next?: string;
  gather: boolean;
  onDigit?: (digit: string, session: VoiceSession) => StateResult;
}

export const flow: Record<string, FlowState> = {
  // non-gather states include a next pointer
  intro: {
    prompt: () => say('Hello! Welcome to SoundSteps. This is a short lesson on Basic Addition. The lesson will take about three minutes. To hear options at any time, press 9.'),
    next: 'concept',
    gather: false,
  },
  concept: {
    prompt: () => say('Addition means putting groups together. If you have two apples, and someone gives you three more, you count them together to get five.'),
    next: 'example1',
    gather: false,
  },
  example1: {
    prompt: (baseUrl) => gather(baseUrl!, "Listen: Two apples, then three apples. How many apples do we have in total? Press 1 for Four, press 2 for Five, press 3 for Six, press 4 for I don't know."),
    gather: true,
    onDigit: (digit, session) => {
      if (digit === '9') return { state: 'example1', feedback: say('Repeating the question.') };
      if (digit === '2') {
        session.score = (session.score || 0) + 1;
        return { state: 'practice', feedback: say('Correct! Two plus three equals five.') };
      }
      return { state: 'practice', feedback: say('The correct answer is five. Two plus three equals five.') };
    },
  },
  practice: {
    prompt: () => say('Now practice: hold up two fingers, then three more fingers. Count them slowly... one... two... three... four... five. Great job.'),
    next: 'quizSetup',
    gather: false,
  },
  quizSetup: {
    prompt: () => say('Now a quick quiz with two questions. For each question press the number that matches the answer. If you want me to repeat the question, press 9.'),
    next: 'q1',
    gather: false,
  },
  q1: {
    prompt: (baseUrl) => gather(baseUrl!, 'Q1: What is 1 plus 2? Press 1 for 2, press 2 for 3, press 3 for 4, press 4 for 5.'),
    gather: true,
    onDigit: (digit, session) => {
      if (digit === '9') return { state: 'q1', feedback: say('Repeating the question.') };
      session.answers.push(digit);
      if (digit === '2') session.score += 1; // correct
      return { state: 'q2' };
    }
  },
  q2: {
    prompt: (baseUrl) => gather(baseUrl!, 'Q2: If you have three bananas and get two more, how many bananas do you have? Press 1 for 4, press 2 for 5, press 3 for 6, press 4 for 3.'),
    gather: true,
    onDigit: (digit, session) => {
      if (digit === '9') return { state: 'q2', feedback: say('Repeating the question.') };
      session.answers.push(digit);
      if (digit === '2') session.score += 1; // correct
      return { state: 'wrap' };
    }
  },
  wrap: {
    prompt: (baseUrl, session) => {
      const text = `Thanks! You finished the lesson. You answered ${session!.score} out of 2 questions correctly. If you would like a caregiver to receive a short SMS summary, press 8 now. To repeat the lesson, press 9. To end the call, press 0.`;
      return gather(baseUrl!, text, { timeout: 6, numDigits: 1 });
    },
    gather: true,
    onDigit: (digit) => {
      if (digit === '9') return { state: 'intro' };
      if (digit === '8') return { state: 'caregiverCollect' };
      return { state: 'end' };
    }
  },
  caregiverCollect: {
    prompt: (baseUrl) => `${say('Please enter the caregiver phone number starting with country code. For example, 2547 followed by digits. Then press the hash key.')}` + gather(baseUrl!, 'Enter number now, then press hash.', { timeout: 15, numDigits: 0, finishOnKey: '#' }),
    gather: true,
    onDigit: (digits, session) => {
      session.caregiverPhone = digits;
      return { state: 'caregiverConfirm', feedback: say('Thanks, we will send a short summary now.') };
    }
  },
  caregiverConfirm: {
    prompt: () => say('You can now end the call. Goodbye and keep practicing!'),
    next: 'end',
    gather: false,
  },
  end: {
    prompt: () => '<Say>Goodbye and keep practicing!</Say><Hangup/>',
    gather: false,
  }
};

export function buildVoiceResponse(xmlInner: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${xmlInner}</Response>`;
}

export function isGatherState(stateName: string): boolean {
  return !!flow[stateName]?.gather;
}

export function nextOf(stateName: string): string | null {
  return flow[stateName]?.next || null;
}