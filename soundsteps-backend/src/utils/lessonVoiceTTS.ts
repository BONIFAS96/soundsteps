import { getLessonById } from '../models/Lesson';

/**
 * Convert lesson data from database to voice-ready content for Text-to-Speech
 */
export async function prepareLessonForVoice(lessonId: string) {
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  // Convert lesson description to voice-friendly content
  const voiceContent = {
    title: lesson.title,
    description: lesson.description || `Welcome to the lesson: ${lesson.title}`,
    textContent: `
      ${lesson.description || 'Today we will explore new concepts and practice with interactive questions.'}
      This lesson is designed to help you learn through listening and responding.
      Pay close attention as we go through the content, and be ready to answer questions using your phone keypad.
      Remember to press the number that corresponds to your chosen answer.
    `.trim(),
    estimatedDuration: lesson.durationSeconds || 180,
  };

  return voiceContent;
}

/**
 * Generate XML response for lesson introduction
 */
export function generateLessonIntroXML(voiceContent: any, baseUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Welcome to SoundSteps! You are about to start: ${voiceContent.title}</Say>
    <Say>${voiceContent.description}</Say>
    <Pause length="1"/>
    <Say>${voiceContent.textContent}</Say>
    <Pause length="2"/>
    <Say>This lesson will take approximately ${Math.floor(voiceContent.estimatedDuration / 60)} minutes. Let's begin!</Say>
    <GetDigits numDigits="1" timeout="20" finishOnKey="" callbackUrl="${baseUrl}/webhooks/voice/lesson">
        <Say>Press 1 to start the lesson, or 9 to end the call</Say>
    </GetDigits>
</Response>`;
}

/**
 * Generate XML response for quiz questions
 */
export function generateQuizQuestionXML(question: any, questionIndex: number, baseUrl: string): string {
  const optionsText = question.options
    .map((option: string, index: number) => `${index + 1} for ${option}`)
    .join(', ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Question ${questionIndex + 1}: ${question.question}</Say>
    <Pause length="1"/>
    <GetDigits numDigits="1" timeout="20" finishOnKey="" callbackUrl="${baseUrl}/webhooks/voice/dtmf">
        <Say>Press ${optionsText}</Say>
    </GetDigits>
</Response>`;
}

/**
 * Generate XML response for lesson completion
 */
export function generateLessonCompletionXML(score: number, totalQuestions: number): string {
  const percentage = Math.round((score / totalQuestions) * 100);
  let feedback = '';

  if (percentage >= 90) {
    feedback = 'Excellent work! You have mastered this topic.';
  } else if (percentage >= 70) {
    feedback = 'Good job! You have a solid understanding.';
  } else if (percentage >= 50) {
    feedback = 'Not bad! Consider reviewing the material again.';
  } else {
    feedback = 'Keep practicing! Learning takes time and patience.';
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Congratulations! You have completed the lesson.</Say>
    <Say>Your final score is ${score} out of ${totalQuestions}, which is ${percentage} percent.</Say>
    <Say>${feedback}</Say>
    <Say>Thank you for learning with SoundSteps. Your progress summary will be sent via SMS.</Say>
    <Say>Goodbye!</Say>
</Response>`;
}

export default {
  prepareLessonForVoice,
  generateLessonIntroXML,
  generateQuizQuestionXML,
  generateLessonCompletionXML,
};