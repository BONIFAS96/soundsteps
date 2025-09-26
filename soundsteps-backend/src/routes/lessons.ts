import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAllLessons, getLessonById, createLesson, updateLesson, deleteLesson } from '../models/Lesson';
import { AuthRequest } from '../utils/auth';

const router = express.Router();

/**
 * GET /lessons - Fetch all lessons
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    console.log('Backend: Fetching all lessons');
    const lessons = await getAllLessons();
    console.log('Backend: Fetched lessons:', lessons);
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
    const { title, description, durationSeconds } = req.body;
    
    // Validation
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const lessonData = {
      id: uuidv4(),
      title,
      description,
      durationSeconds: parseInt(durationSeconds) || 180,
      createdBy: req.user?.id
    };
    
    console.log('Backend: Creating lesson with data:', lessonData);
    const lesson = await createLesson(lessonData);
    console.log('Backend: Created lesson:', lesson);
    
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

/**
 * PUT /lessons/:id - Update existing lesson
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, durationSeconds, isActive } = req.body;
    
    // Check if lesson exists
    const existingLesson = await getLessonById(id);
    if (!existingLesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    // Validation
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const updateData = {
      title,
      description,
      durationSeconds: parseInt(durationSeconds) || existingLesson.durationSeconds,
      isActive: isActive !== undefined ? isActive : true
    };
    
    console.log('Backend: Updating lesson with data:', updateData);
    const updatedLesson = await updateLesson(id, updateData);
    console.log('Backend: Updated lesson:', updatedLesson);
    
    // Emit to dashboard
    const io = req.app.get('io');
    io.emit('lesson-updated', { lesson: updatedLesson });
    
    res.json({ lesson: updatedLesson });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

/**
 * DELETE /lessons/:id - Delete lesson
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if lesson exists
    const existingLesson = await getLessonById(id);
    if (!existingLesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    console.log('Backend: Deleting lesson:', id);
    await deleteLesson(id);
    
    // Emit to dashboard
    const io = req.app.get('io');
    io.emit('lesson-deleted', { lessonId: id });
    
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

export default router;