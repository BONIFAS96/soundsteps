import { getDb } from '../utils/database';

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  audioUrl?: string;
  durationSeconds?: number;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const db = getDb();
  const row = await db.get('SELECT * FROM lessons WHERE id = ?', id);
  
  if (!row) return null;
  
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    audioUrl: row.audio_url,
    durationSeconds: row.duration_seconds,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined
  };
}

export async function getAllLessons(): Promise<Lesson[]> {
  const db = getDb();
  const rows = await db.all('SELECT * FROM lessons ORDER BY created_at DESC');
  
  return rows.map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    audioUrl: row.audio_url,
    durationSeconds: row.duration_seconds,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined
  }));
}

export async function createLesson(lesson: Partial<Lesson>): Promise<Lesson> {
  const db = getDb();
  
  await db.run(`
    INSERT INTO lessons (id, title, description, audio_url, duration_seconds, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    lesson.id,
    lesson.title,
    lesson.description,
    lesson.audioUrl,
    lesson.durationSeconds,
    lesson.createdBy
  ]);

  const created = await getLessonById(lesson.id!);
  return created!;
}