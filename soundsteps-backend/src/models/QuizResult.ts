import { getDb } from '../utils/database';

export interface QuizResult {
  id: string;
  sessionId: string;
  questionId: string;
  answer: string;
  correct: boolean;
  createdAt?: Date;
}

export async function createQuizResult(result: Partial<QuizResult>): Promise<QuizResult> {
  const db = getDb();
  
  await db.run(`
    INSERT INTO quiz_results (id, session_id, question_id, answer, correct)
    VALUES (?, ?, ?, ?, ?)
  `, [
    result.id,
    result.sessionId,
    result.questionId,
    result.answer,
    result.correct ? 1 : 0
  ]);

  const created = await getQuizResultById(result.id!);
  return created!;
}

export async function getQuizResultById(id: string): Promise<QuizResult | null> {
  const db = getDb();
  const row = await db.get('SELECT * FROM quiz_results WHERE id = ?', id);
  
  if (!row) return null;
  
  return {
    id: row.id,
    sessionId: row.session_id,
    questionId: row.question_id,
    answer: row.answer,
    correct: Boolean(row.correct),
    createdAt: new Date(row.created_at)
  };
}

export async function getQuizResultsBySession(sessionId: string): Promise<QuizResult[]> {
  const db = getDb();
  const rows = await db.all('SELECT * FROM quiz_results WHERE session_id = ? ORDER BY created_at', sessionId);
  
  return rows.map((row: any) => ({
    id: row.id,
    sessionId: row.session_id,
    questionId: row.question_id,
    answer: row.answer,
    correct: Boolean(row.correct),
    createdAt: new Date(row.created_at)
  }));
}