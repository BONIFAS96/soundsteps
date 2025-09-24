import { getDb } from '../utils/database';

export interface Session {
  id: string;
  callId: string;
  callerPhone: string;
  lessonId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  score?: number;
  answers?: string; // JSON string
  startTime?: Date;
  endTime?: Date;
  createdAt?: Date;
}

export async function createSession(session: Partial<Session>): Promise<Session | null> {
  const db = getDb();
  const id = session.id;
  
  await db.run(`
    INSERT INTO sessions (id, call_id, caller_phone, lesson_id, status, start_time)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    id,
    session.callId,
    session.callerPhone,
    session.lessonId,
    session.status || 'IN_PROGRESS',
    session.startTime?.toISOString()
  ]);

  return getSessionById(id!);
}

export async function updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
  const db = getDb();
  
  const setClause = Object.keys(updates)
    .map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`)
    .join(', ');
  
  const values = Object.values(updates).map(value => 
    value instanceof Date ? value.toISOString() : value
  );
  
  await db.run(`UPDATE sessions SET ${setClause} WHERE id = ?`, [...values, id]);
  return getSessionById(id);
}

export async function getSessionById(id: string): Promise<Session | null> {
  const db = getDb();
  const row = await db.get('SELECT * FROM sessions WHERE id = ?', id);
  
  if (!row) return null;
  
  return {
    id: row.id,
    callId: row.call_id,
    callerPhone: row.caller_phone,
    lessonId: row.lesson_id,
    status: row.status,
    score: row.score,
    answers: row.answers,
    startTime: row.start_time ? new Date(row.start_time) : undefined,
    endTime: row.end_time ? new Date(row.end_time) : undefined,
    createdAt: new Date(row.created_at)
  };
}

export async function getSessionByCallId(callId: string): Promise<Session | null> {
  const db = getDb();
  const row = await db.get('SELECT * FROM sessions WHERE call_id = ?', callId);
  
  if (!row) return null;
  
  return {
    id: row.id,
    callId: row.call_id,
    callerPhone: row.caller_phone,
    lessonId: row.lesson_id,
    status: row.status,
    score: row.score,
    answers: row.answers,
    startTime: row.start_time ? new Date(row.start_time) : undefined,
    endTime: row.end_time ? new Date(row.end_time) : undefined,
    createdAt: new Date(row.created_at)
  };
}

export async function getRecentSessions(limit = 50): Promise<Session[]> {
  const db = getDb();
  const rows = await db.all('SELECT * FROM sessions ORDER BY created_at DESC LIMIT ?', limit);
  
  return rows.map(row => ({
    id: row.id,
    callId: row.call_id,
    callerPhone: row.caller_phone,
    lessonId: row.lesson_id,
    status: row.status,
    score: row.score,
    answers: row.answers,
    startTime: row.start_time ? new Date(row.start_time) : undefined,
    endTime: row.end_time ? new Date(row.end_time) : undefined,
    createdAt: new Date(row.created_at)
  }));
}