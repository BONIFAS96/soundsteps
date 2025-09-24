import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAllLessons, getLessonById, createLesson } from '../models/Lesson';
import { AuthRequest } from '../utils/auth';

const router = express.Router();

/**
 * GET /lessons - Fetch all lessons
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const lessons = await getAllLessons();
    res.json({ lessons });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

/**
 * GET /lessons/:id - Fetch specific lesson
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = await getLessonById(id);
    
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    res.json({ lesson });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

/**
 * POST /lessons - Create new lesson
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, audioUrl, durationSeconds } = req.body;
    
    // Validation
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const lessonData = {
      id: uuidv4(),
      title,
      description,
      audioUrl,
      durationSeconds: parseInt(durationSeconds) || 180,
      createdBy: req.user?.id
    };
    
    const lesson = await createLesson(lessonData);
    
    // Emit to dashboard
    const io = req.app.get('io');
    io.emit('lesson-created', { lesson });
    
    res.status(201).json({ lesson });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

/**
 * POST /lessons/:id/quiz-questions - Add quiz questions to lesson
 * TODO: Implement quiz question management
 */
router.post('/:id/quiz-questions', async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Implement quiz question creation
    res.status(501).json({ error: 'Quiz question management not implemented yet' });
  } catch (error) {
    console.error('Add quiz questions error:', error);
    res.status(500).json({ error: 'Failed to add quiz questions' });
  }
});

export default router;