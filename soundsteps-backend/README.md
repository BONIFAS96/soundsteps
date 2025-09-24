# SoundSteps Hybrid - IVR + React Native Companion

Voice-first IVR micro-lessons for visually impaired learners + React Native teacher/caregiver companion app.

## Architecture

- **Backend**: Node.js + Express + TypeScript + PostgreSQL/SQLite
- **Mobile App**: React Native (Expo) for teachers/admins
- **Voice/SMS**: Africa's Talking IVR, USSD, SMS integration
- **Real-time**: Socket.IO for live call monitoring

## Project Structure

```
soundsteps-hybrid/
├─ backend/          # Node.js API server
│  ├─ src/
│  │  ├─ routes/     # API endpoints
│  │  ├─ models/     # Database models
│  │  ├─ utils/      # Africa's Talking client
│  │  └─ webhooks/   # IVR/USSD/SMS webhooks
│  └─ package.json
└─ app/              # React Native companion
   ├─ src/screens/   # Login, Dashboard, LessonBuilder
   ├─ src/api/       # Backend API client
   └─ app.config.ts
```

## Features

### For Learners (Any Phone)
- Call IVR number → 3-minute audio lesson → DTMF quiz
- Dial USSD code → lesson schedule, results, callback request
- Receive SMS summaries and reminders

### For Teachers/Caregivers (React Native App)  
- Upload audio lessons and create quizzes
- Monitor live calls and quiz scores
- Trigger outbound calls to specific learners
- Receive push notifications for completed sessions
- View analytics and progress reports

## Quick Start

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in Africa's Talking credentials
npm run dev
```

### React Native App Setup  
```bash
cd app
npm install
npx expo start
```

### Webhook Configuration
Use ngrok to expose backend, then configure Africa's Talking:
- Voice: `https://<ngrok>/webhooks/voice`
- USSD: `https://<ngrok>/webhooks/ussd`  
- SMS: `https://<ngrok>/webhooks/sms`

## User Flows

### IVR Call Flow
1. Learner calls AT voice number
2. System plays welcome + lesson audio
3. Asks 3 quiz questions via DTMF
4. Stores results and sends SMS summary
5. Optional: caregiver gets notification in RN app

### Teacher Workflow  
1. Login to RN app with JWT
2. Upload new lesson audio file
3. Create quiz questions
4. Publish lesson → available via IVR
5. Monitor live calls on dashboard
6. Review learner progress and scores

## Next Steps
- [ ] Database schema migration
- [ ] Audio file storage (AWS S3/Supabase)
- [ ] Push notifications setup
- [ ] Production deployment guide