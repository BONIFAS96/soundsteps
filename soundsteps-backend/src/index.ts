import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';

import { initDatabase } from './utils/database';
import { authMiddleware } from './utils/auth';
import lessonsRouter from './routes/lessons';
import sessionsRouter from './routes/sessions';
import authRouter from './routes/auth';
import { voiceRouter } from './routes/webhooks/voice';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: "*" }
});

// Global middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Share Socket.IO instance
app.set('io', io);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '0.1.0' 
  });
});

// Auth routes (public)
app.use('/auth', authRouter);

// API routes (protected)
app.use('/lessons', authMiddleware, lessonsRouter);
app.use('/sessions', authMiddleware, sessionsRouter);

// Africa's Talking webhooks (public)
app.use('/webhooks', voiceRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize database
    await initDatabase();
    console.log('📊 Database initialized');

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 SoundSteps backend running on http://localhost:${PORT}`);
      console.log(`📱 Webhooks ready for Africa's Talking`);
      console.log(`🔗 Base URL: ${process.env.BASE_URL || 'http://localhost:' + PORT}`);
    });

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      console.log('📡 Dashboard connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('📡 Dashboard disconnected:', socket.id);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { io };