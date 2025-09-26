import express from 'express';
import { makeCall, sendLessonSummary, sendAirtimeReward } from '../utils/africasTalking';

const router = express.Router();

/**
 * Demo endpoint to test Africa's Talking Voice Call integration
 * This will initiate a voice call to a student for lesson participation
 */
router.post('/demo-voice-call', async (req, res) => {
  try {
    const { phoneNumber, studentName } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    const result = await makeCall(phoneNumber, studentName || 'Student');
    
    res.json({
      success: true,
      message: 'Voice call initiated successfully',
      data: result
    });
  } catch (error) {
    console.error('Demo voice call error:', error);
    res.status(500).json({ error: 'Failed to make voice call' });
  }
});

/**
 * Demo endpoint to test SMS Lesson Summary sending to caregiver
 * This demonstrates the bilingual SMS capability
 */
router.post('/demo-sms', async (req, res) => {
  try {
    const { caregiverPhone, studentName, lessonTitle, score, language } = req.body;
    
    if (!caregiverPhone) {
      return res.status(400).json({ error: 'Caregiver phone number is required' });
    }
    
    const lessonData = {
      title: lessonTitle || 'English Basics',
      score: score || 85,
      completedQuestions: 8,
      totalQuestions: 10,
      duration: '15 minutes',
      feedback: 'Excellent work!'
    };
    
    const result = await sendLessonSummary(
      caregiverPhone, 
      studentName || 'John', 
      lessonData.title,
      lessonData.score,
      lessonData.totalQuestions,
      language as 'en' | 'sw' || 'en'
    );
    
    res.json({
      success: true,
      message: 'SMS lesson summary sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Demo SMS error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

/**
 * Demo endpoint to test Airtime Reward sending
 * This demonstrates the performance-based airtime distribution
 */
router.post('/demo-airtime', async (req, res) => {
  try {
    const { phoneNumber, recipient, score } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    const result = await sendAirtimeReward(
      phoneNumber,
      score || 85,
      100, // out of 100 for percentage calculation
      recipient as 'student' | 'caregiver' || 'student'
    );
    
    res.json({
      success: true,
      message: 'Airtime reward sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Demo airtime error:', error);
    res.status(500).json({ error: 'Failed to send airtime' });
  }
});

/**
 * Complete demo endpoint that showcases all three Africa's Talking features
 * This simulates a complete lesson flow: voice call -> lesson completion -> SMS summary -> airtime reward
 */
router.post('/demo-complete-flow', async (req, res) => {
  try {
    const { 
      studentPhone, 
      caregiverPhone, 
      studentName = 'Demo Student',
      language = 'en' 
    } = req.body;
    
    if (!studentPhone || !caregiverPhone) {
      return res.status(400).json({ 
        error: 'Both student and caregiver phone numbers are required' 
      });
    }
    
    const results = [];
    
    // Step 1: Initiate voice call for lesson
    try {
      const voiceResult = await makeCall(studentPhone, studentName);
      results.push({ step: 'voice_call', success: true, data: voiceResult });
    } catch (error: any) {
      results.push({ step: 'voice_call', success: false, error: error?.message || 'Unknown error' });
    }
    
    // Step 2: Send lesson summary to caregiver (simulated completion)
    try {
      const lessonData = {
        title: 'Demo Math Lesson',
        score: 90,
        completedQuestions: 9,
        totalQuestions: 10,
        duration: '12 minutes',
        feedback: 'Excellent performance!'
      };
      
      const smsResult = await sendLessonSummary(
        caregiverPhone, 
        studentName, 
        lessonData.title,
        lessonData.score,
        lessonData.totalQuestions,
        language as 'en' | 'sw'
      );
      results.push({ step: 'sms_summary', success: true, data: smsResult });
    } catch (error: any) {
      results.push({ step: 'sms_summary', success: false, error: error?.message || 'Unknown error' });
    }
    
    // Step 3: Send airtime reward to student for good performance
    try {
      const airtimeResult = await sendAirtimeReward(studentPhone, 9, 10, 'student');
      results.push({ step: 'airtime_reward', success: true, data: airtimeResult });
    } catch (error: any) {
      results.push({ step: 'airtime_reward', success: false, error: error?.message || 'Unknown error' });
    }
    
    res.json({
      success: true,
      message: 'Complete Africa\'s Talking flow demonstration completed',
      results: results,
      summary: {
        voice_calls: 'Interactive lesson via phone call',
        sms_notifications: 'Bilingual lesson summaries to caregivers',
        airtime_rewards: 'Performance-based rewards system'
      }
    });
    
  } catch (error) {
    console.error('Complete flow demo error:', error);
    res.status(500).json({ error: 'Failed to complete demonstration flow' });
  }
});

export default router;