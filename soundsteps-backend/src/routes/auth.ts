import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../utils/database';
import { generateToken } from '../utils/auth';

const router = express.Router();

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  school?: string;
}

/**
 * POST /auth/login - User login
 */
router.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /auth/register - User registration
 */
router.post('/register', async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { email, password, name, phone, school } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: 'Password must contain at least one uppercase letter, lowercase letter, and number' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Validate phone number if provided
    if (phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Please enter a valid phone number' });
      }
    }

    const db = getDb();
    
    // Check if user already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await db.run(
      'INSERT INTO users (id, email, password_hash, name, phone, school, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      userId, email, passwordHash, name, phone || null, school || null, 'teacher'
    );

    // Generate token
    const token = generateToken({
      id: userId,
      email,
      role: 'teacher'
    });

    res.status(201).json({
      token,
      user: {
        id: userId,
        email,
        name,
        phone: phone || null,
        school: school || null,
        role: 'teacher',
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;