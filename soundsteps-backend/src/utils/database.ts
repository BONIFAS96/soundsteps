import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database;

export async function initDatabase(): Promise<void> {
  db = await open({
    filename: process.env.DATABASE_URL?.replace('sqlite:', '') || './soundsteps.db',
    driver: sqlite3.Database,
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      school TEXT,
      role TEXT DEFAULT 'teacher',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      duration_seconds INTEGER,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      question_text TEXT NOT NULL,
      options TEXT, -- JSON array
      correct_answer TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lesson_id) REFERENCES lessons (id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      call_id TEXT UNIQUE,
      caller_phone TEXT,
      lesson_id TEXT,
      status TEXT DEFAULT 'IN_PROGRESS',
      score INTEGER DEFAULT 0,
      answers TEXT, -- JSON array
      current_state TEXT DEFAULT 'intro',
      caregiver_phone TEXT,
      start_time DATETIME,
      end_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lesson_id) REFERENCES lessons (id)
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      answer TEXT,
      correct BOOLEAN,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions (id),
      FOREIGN KEY (question_id) REFERENCES quiz_questions (id)
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_sessions_call_id ON sessions (call_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions (status);
    CREATE INDEX IF NOT EXISTS idx_quiz_results_session ON quiz_results (session_id);
  `);

  console.log('📊 Database tables created/verified');

  // Add migrations for new columns if they don't exist
  try {
    await db.exec(`
      ALTER TABLE users ADD COLUMN phone TEXT;
      ALTER TABLE users ADD COLUMN school TEXT;
    `);
    console.log('📊 Database migrations applied');
  } catch (error) {
    // Columns might already exist, ignore error
    console.log('📊 Database already up to date');
  }

  // Insert default lesson if not exists
  const existingLesson = await db.get('SELECT id FROM lessons WHERE id = ?', 'basic-addition-001');
  if (!existingLesson) {
    await db.run(
      'INSERT INTO lessons (id, title, description, duration_seconds) VALUES (?, ?, ?, ?)',
      'basic-addition-001',
      'Basic Addition',
      '3-minute interactive lesson on adding small numbers',
      180
    );

    // Add quiz questions
    await db.run(
      'INSERT INTO quiz_questions (id, lesson_id, question_text, options, correct_answer, order_index) VALUES (?, ?, ?, ?, ?, ?)',
      'q1-add-001',
      'basic-addition-001',
      'What is 2 plus 3?',
      JSON.stringify(['4', '5', '6', '7']),
      '5',
      1
    );

    await db.run(
      'INSERT INTO quiz_questions (id, lesson_id, question_text, options, correct_answer, order_index) VALUES (?, ?, ?, ?, ?, ?)',
      'q2-add-001',
      'basic-addition-001',
      'If you have 1 banana and get 2 more bananas, how many do you have?',
      JSON.stringify(['2', '3', '4', '5']),
      '3',
      2
    );

    await db.run(
      'INSERT INTO quiz_questions (id, lesson_id, question_text, options, correct_answer, order_index) VALUES (?, ?, ?, ?, ?, ?)',
      'q3-add-001',
      'basic-addition-001',
      'What is 4 plus 1?',
      JSON.stringify(['4', '5', '6', '7']),
      '5',
      3
    );

    console.log('📚 Default lesson and quiz questions created');
  }
}

export function getDb(): Database {
  return db;
}