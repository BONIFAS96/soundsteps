import { getDb } from '../utils/database';

export interface Lesson {
  id: string;
  title: string;
  description?: string;
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
    durationSeconds: row.duration_seconds,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined
  }));
}

export async function createLesson(lesson: Partial<Lesson>): Promise<Lesson> {
  const db = getDb();
  
  await db.run(`
    INSERT INTO lessons (id, title, description, duration_seconds, created_by)
    VALUES (?, ?, ?, ?, ?)
  `, [
    lesson.id,
    lesson.title,
    lesson.description,
    lesson.durationSeconds,
    lesson.createdBy
  ]);

  const created = await getLessonById(lesson.id!);
  return created!;
}

export async function updateLesson(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
  const db = getDb();
  
  await db.run(`
    UPDATE lessons 
    SET title = ?, description = ?, duration_seconds = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    lesson.title,
    lesson.description,
    lesson.durationSeconds,
    id
  ]);

  const updated = await getLessonById(id);
  return updated!;
}

export async function deleteLesson(id: string): Promise<void> {
  const db = getDb();
  
  await db.run('DELETE FROM lessons WHERE id = ?', id);
}