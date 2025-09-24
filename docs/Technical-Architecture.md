# SoundSteps Technical Architecture Documentation

## System Overview

SoundSteps is a hybrid learning platform that combines voice-first IVR (Interactive Voice Response) micro-lessons with a modern React Native companion app. The system is designed to serve visually impaired and low-literacy learners through accessible voice interactions while providing teachers and caregivers with powerful management tools.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       SOUNDSTEPS ECOSYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │   React Native   │    │   Node.js API    │                  │
│  │  Companion App   │◄──►│    Backend       │                  │
│  │  (soundsteps-app)│    │(soundsteps-backend)                 │
│  └──────────────────┘    └──────────────────┘                  │
│           │                        │                           │
│           │               ┌────────▼────────┐                  │
│           │               │   SQLite DB     │                  │
│           │               │   - Users       │                  │
│           │               │   - Lessons     │                  │
│           │               │   - Sessions    │                  │
│           │               │   - Quiz Results│                  │
│           │               └─────────────────┘                  │
│           │                        │                           │
│           │               ┌────────▼────────┐                  │
│           └──────────────►│ Africa's Talking│                  │
│                           │   Voice/SMS     │                  │
│                           │   Integration   │                  │
│                           └─────────────────┘                  │
│                                    │                           │
│                           ┌────────▼────────┐                  │
│                           │   IVR System    │                  │
│                           │ - Voice Lessons │                  │
│                           │ - DTMF Quiz     │                  │
│                           │ - SMS Summaries │                  │
│                           │ - Airtime Rewards│                  │
│                           └─────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend (soundsteps-backend/)
- **Framework**: Node.js + Express + TypeScript
- **Database**: SQLite with sqlite3 driver
- **Authentication**: JWT with bcrypt password hashing
- **External APIs**: Africa's Talking SDK (Voice, SMS, Airtime)
- **Real-time**: Socket.IO for live call monitoring
- **Build**: TypeScript compiler with ES modules

### Frontend (soundsteps-app/)
- **Framework**: React Native with Expo (managed workflow)
- **Language**: TypeScript
- **Navigation**: Expo Router with file-based routing
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Yup validation
- **Storage**: Expo SecureStore for JWT tokens
- **HTTP Client**: Axios with interceptors
- **UI**: Custom components with StyleSheet and theme system

### Voice Integration
- **Provider**: Africa's Talking Voice API
- **Format**: Voice XML responses with TTS
- **Input**: DTMF (keypad) for quiz interactions
- **Webhooks**: Express routes handling voice events
- **Call Flow**: State machine managing lesson progression

## Database Schema

### Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher',
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Lessons Table
```sql
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT,
  duration INTEGER,
  is_active BOOLEAN DEFAULT 1,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users (id)
);
```

### Quiz Questions Table
```sql
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  correct_answer INTEGER NOT NULL,
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (lesson_id) REFERENCES lessons (id)
);
```

### Sessions Table
```sql
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  call_id TEXT,
  caller_phone TEXT,
  lesson_id TEXT,
  answers TEXT,
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'IN_PROGRESS',
  current_state TEXT DEFAULT 'intro',
  caregiver_phone TEXT,
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME
);
```

### Quiz Results Table
```sql
CREATE TABLE IF NOT EXISTS quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  question_id INTEGER NOT NULL,
  answer_given INTEGER,
  is_correct BOOLEAN,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions (id),
  FOREIGN KEY (question_id) REFERENCES quiz_questions (id)
);
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login with JWT token generation
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user profile

### Lessons Management
- `GET /lessons` - List all lessons with pagination
- `POST /lessons` - Create new lesson (requires authentication)
- `GET /lessons/:id` - Get specific lesson details
- `PUT /lessons/:id` - Update lesson (requires authentication)
- `DELETE /lessons/:id` - Delete lesson (requires authentication)

### Sessions & Analytics
- `GET /sessions` - List call sessions with filters
- `GET /sessions/stats` - Get dashboard statistics
- `POST /sessions` - Create new session (used by IVR)

### Voice Webhooks (Africa's Talking)
- `POST /webhooks/voice/voice` - Handle incoming voice calls
- `POST /webhooks/voice/dtmf` - Process DTMF (keypad) input
- `POST /webhooks/voice/status` - Voice call status updates

### SMS Integration
- `POST /webhooks/sms/delivery` - SMS delivery status callbacks
- `POST /webhooks/sms/inbound` - Handle incoming SMS responses

## Key Features Implementation

### Voice Call Flow State Machine

The IVR system uses a state machine defined in `lessonFlow.ts`:

1. **intro**: Welcome message and lesson overview
2. **concept**: Core learning concept explanation
3. **example1**: Interactive example with DTMF input
4. **practice**: Hands-on practice instructions
5. **quizSetup**: Quiz introduction
6. **q1, q2**: Quiz questions with DTMF answers
7. **wrap**: Results and options for next steps
8. **caregiverCollect**: Caregiver phone number collection
9. **caregiverConfirm**: SMS sending confirmation
10. **end**: Call termination

### Authentication Flow

1. User enters credentials in React Native app
2. Backend validates against users table with bcrypt
3. JWT token generated and returned with user data
4. Frontend stores token in SecureStore
5. All API requests include Authorization header
6. Backend middleware validates JWT on protected routes

### Real-time Updates

- Socket.IO server in backend emits call events
- React Native app can connect for live monitoring
- Dashboard shows real-time call status and logs
- Push notifications for completed sessions (ready for implementation)

## Security Implementation

### Backend Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Signed tokens with expiration
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Configured for React Native app
- **Input Validation**: Express middleware for request validation

### Frontend Security  
- **Secure Token Storage**: Expo SecureStore for JWT
- **Automatic Token Refresh**: Axios interceptors handle expiration
- **Protected Routes**: Authentication checks with redirects
- **Form Validation**: Client-side validation with Yup schemas

## Development & Deployment

### Development Setup
```bash
# Backend
cd soundsteps-backend
npm install
npm run dev

# Frontend
cd soundsteps-app
npm install
npx expo start
```

### Environment Variables
```bash
# Backend (.env)
PORT=3000
JWT_SECRET=your_jwt_secret
AT_API_KEY=your_africas_talking_key
AT_USERNAME=your_at_username

# Frontend (.env)
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Production Considerations

1. **Database**: Migrate from SQLite to PostgreSQL for production
2. **File Storage**: Implement AWS S3 or similar for audio files
3. **Load Balancing**: Use PM2 or Docker for backend scaling
4. **SSL/TLS**: HTTPS required for voice webhooks
5. **Monitoring**: Add logging with Winston and error tracking
6. **Backup Strategy**: Automated database backups
7. **CDN**: Serve audio files from CDN for better performance

## Integration Points

### Africa's Talking Integration
- **Voice API**: Handles outbound calls and IVR webhooks
- **SMS API**: Sends lesson summaries to caregivers  
- **Airtime API**: Reward system for completed lessons
- **Webhook Configuration**: Properly configured callback URLs

### React Native App Integration
- **API Communication**: Axios client with JWT authentication
- **Real-time Features**: Socket.IO for live updates
- **File Upload**: Ready for audio file upload implementation
- **Push Notifications**: Expo Notifications setup ready

## Performance Optimizations

### Backend Optimizations
- **Database Indexing**: Proper indexes on frequently queried columns
- **Connection Pooling**: SQLite WAL mode for better concurrency
- **Caching**: In-memory caching for frequently accessed data
- **Async Processing**: Background jobs for SMS and airtime

### Frontend Optimizations
- **Query Caching**: React Query with optimized cache strategies
- **Image Optimization**: Expo Image for better performance
- **Bundle Splitting**: Expo Router enables automatic code splitting
- **Offline Support**: Ready for offline lesson caching

## Testing Strategy

### Backend Testing
- **Unit Tests**: Jest for business logic testing
- **Integration Tests**: Supertest for API endpoint testing
- **Voice Flow Testing**: Mock Africa's Talking webhooks
- **Database Testing**: In-memory SQLite for test isolation

### Frontend Testing
- **Component Tests**: React Testing Library
- **E2E Tests**: Maestro for mobile app testing
- **API Integration**: Mock service worker for API mocking
- **Navigation Tests**: Expo Router testing utilities

## Monitoring & Analytics

### System Monitoring
- **Call Success Rates**: Track completion vs abandonment
- **Quiz Performance**: Average scores and question analysis
- **SMS Delivery**: Success rates and failure reasons
- **API Performance**: Response times and error rates

### User Analytics
- **Learning Progress**: Individual learner progression
- **Content Effectiveness**: Most/least successful lessons
- **Usage Patterns**: Peak call times and durations
- **Caregiver Engagement**: SMS response rates

This architecture provides a solid foundation for the SoundSteps platform with room for scalability and feature expansion.