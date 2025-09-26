# SoundSteps Production Deployment Checklist

## Pre-Deployment
- [ ] Backend code pushed to Git repository
- [ ] Environment variables configured (.env.production)
- [ ] Database schema initialized
- [ ] AT credentials obtained and verified

## Hosting Setup
- [ ] Deploy backend to Railway/Render/Heroku
- [ ] Verify deployment URL is accessible
- [ ] Test basic API endpoints (/api/lessons)
- [ ] Database connection working

## Africa's Talking Dashboard Configuration
- [ ] Login to AT dashboard (account.africastalking.com)
- [ ] Create voice application: "SoundSteps Voice"
- [ ] Set callback URL: https://your-domain.com/webhooks/voice/voice-simple
- [ ] Rent virtual number and assign to application
- [ ] Configure SMS sender ID
- [ ] Test API credentials with AT simulator

## Webhook Configuration
- [ ] Primary voice webhook: /webhooks/voice/voice-simple
- [ ] DTMF webhook: /webhooks/voice/dtmf  
- [ ] TTS lesson webhook: /webhooks/voice/tts-lesson
- [ ] All webhooks return proper XML responses

## Testing Phase
- [ ] Make test call to virtual number
- [ ] Verify TTS lesson content plays
- [ ] Test DTMF quiz interactions (press 1-4)
- [ ] Complete full lesson flow
- [ ] Check SMS summary delivery
- [ ] Verify airtime reward (if score ≥ 70%)
- [ ] Monitor console logs for errors

## Production Launch
- [ ] Update AT application to production mode
- [ ] Configure production airtime settings
- [ ] Set up monitoring/logging
- [ ] Document phone number for users
- [ ] Create user instructions

## Post-Launch
- [ ] Monitor call quality and completion rates
- [ ] Check SMS delivery success rates
- [ ] Track airtime reward distribution
- [ ] Gather user feedback
- [ ] Scale infrastructure as needed

---

## Important URLs to Configure in AT Dashboard:
- Voice Callback: https://your-domain.com/webhooks/voice/voice-simple
- DTMF Handler: https://your-domain.com/webhooks/voice/dtmf
- TTS Lessons: https://your-domain.com/webhooks/voice/tts-lesson

## Test Phone Numbers:
- Your AT Virtual Number: +XXX XXXX XXXX (assign in dashboard)
- Test with your own phone for initial validation