# SoundSteps Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the SoundSteps platform to production environments. The system consists of a Node.js backend API and a React Native mobile application.

## System Requirements

### Backend Server
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- **Node.js**: v18.x or later
- **Database**: PostgreSQL 14+ (production) / SQLite (development)
- **Memory**: Minimum 2GB RAM (recommended 4GB+)
- **Storage**: Minimum 20GB available space
- **Network**: HTTPS support required for Africa's Talking webhooks

### Development Environment  
- **Node.js**: v18.x or later
- **npm**: v9.x or later
- **Git**: Latest version
- **Code Editor**: VS Code recommended

## Pre-Deployment Setup

### 1. Domain and SSL Certificate
```bash
# Example with Let's Encrypt and Nginx
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Verify renewal works
sudo certbot renew --dry-run
```

### 2. Database Setup (PostgreSQL)
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql

CREATE DATABASE soundsteps_prod;
CREATE USER soundsteps_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE soundsteps_prod TO soundsteps_user;
\q
```

### 3. Environment Configuration
Create production environment file:

```bash
# /opt/soundsteps/.env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://soundsteps_user:secure_password@localhost:5432/soundsteps_prod

# JWT Configuration  
JWT_SECRET=your_very_secure_random_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Africa's Talking
AT_API_KEY=your_production_api_key
AT_USERNAME=your_production_username
AT_SANDBOX=false

# Server Configuration
BASE_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com,exp://your-expo-host

# File Storage (if using AWS S3)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=soundsteps-audio-files
AWS_REGION=us-west-2

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/soundsteps/app.log
```

## Backend Deployment

### Option 1: Direct Server Deployment

#### 1. Server Preparation
```bash
# Create application user
sudo useradd -m -s /bin/bash soundsteps
sudo usermod -aG sudo soundsteps

# Create application directory
sudo mkdir -p /opt/soundsteps
sudo chown soundsteps:soundsteps /opt/soundsteps

# Switch to application user
sudo su - soundsteps
cd /opt/soundsteps
```

#### 2. Application Deployment
```bash
# Clone repository
git clone https://github.com/yourusername/soundsteps.git .

# Install dependencies
cd soundsteps-backend
npm ci --production

# Build TypeScript
npm run build

# Install PM2 for process management
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'soundsteps-api',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    log_file: '/var/log/soundsteps/combined.log',
    out_file: '/var/log/soundsteps/out.log',
    error_file: '/var/log/soundsteps/error.log',
    max_memory_restart: '1G'
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 3. Nginx Configuration
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/soundsteps << 'EOF'
upstream soundsteps_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        proxy_pass http://soundsteps_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://soundsteps_backend;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/soundsteps /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile
```dockerfile
# soundsteps-backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S soundsteps -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder --chown=soundsteps:nodejs /app/dist ./dist
COPY --chown=soundsteps:nodejs . .

USER soundsteps

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

#### 2. Docker Compose Configuration
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: soundsteps_prod
      POSTGRES_USER: soundsteps_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - soundsteps-network

  api:
    build:
      context: ./soundsteps-backend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://soundsteps_user:${DB_PASSWORD}@postgres:5432/soundsteps_prod
      JWT_SECRET: ${JWT_SECRET}
      AT_API_KEY: ${AT_API_KEY}
      AT_USERNAME: ${AT_USERNAME}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    networks:
      - soundsteps-network
    volumes:
      - /var/log/soundsteps:/app/logs

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - api
    networks:
      - soundsteps-network

volumes:
  postgres_data:

networks:
  soundsteps-network:
    driver: bridge
```

#### 3. Deploy with Docker
```bash
# Deploy
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f api

# Update deployment
docker-compose -f docker-compose.prod.yml build api
docker-compose -f docker-compose.prod.yml up -d api
```

## React Native App Deployment

### 1. Configure Build Settings

#### Update app.json for Production
```json
{
  "expo": {
    "name": "SoundSteps Companion",
    "slug": "soundsteps-companion",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/your-project-id"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.soundsteps"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.soundsteps"
    },
    "web": {
      "favicon": "./assets/images/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

#### Update Environment Configuration
```typescript
// utils/config.ts
const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.yourdomain.com',
  },
  production: {
    API_BASE_URL: 'https://api.yourdomain.com',
  },
};

const getEnvVars = (env = '') => {
  if (env === null || env === undefined || env === '') return ENV.development;
  if (env.indexOf('staging') !== -1) return ENV.staging;
  if (env.indexOf('prod') !== -1) return ENV.production;
  return ENV.development;
};

export default getEnvVars(__DEV__ ? 'development' : 'production');
```

### 2. Build for Production

#### Install EAS CLI
```bash
npm install -g @expo/eas-cli
eas login
```

#### Configure EAS Build
```json
// eas.json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### Build Commands
```bash
# Build for development
eas build --profile development --platform all

# Build for internal testing
eas build --profile preview --platform all

# Build for production
eas build --profile production --platform all

# Submit to app stores
eas submit --profile production --platform all
```

### 3. Over-the-Air (OTA) Updates
```bash
# Create update
eas update --branch production --message "Fix login bug"

# View updates
eas update:list --branch production
```

## Africa's Talking Configuration

### 1. Production Account Setup
1. **Create Production Account**: Register at https://account.africastalking.com
2. **Verify Account**: Complete KYC verification process
3. **Add Credit**: Fund account for Voice/SMS services
4. **Get API Credentials**: Note your username and API key

### 2. Configure Webhooks
```bash
# Voice Configuration
Answer URL: https://api.yourdomain.com/webhooks/voice/voice
DTMF Callback: https://api.yourdomain.com/webhooks/voice/dtmf
Status Callback: https://api.yourdomain.com/webhooks/voice/status

# SMS Configuration  
Delivery Reports: https://api.yourdomain.com/webhooks/sms/delivery
Inbound SMS: https://api.yourdomain.com/webhooks/sms/inbound
```

### 3. Test Webhooks
```bash
# Test voice webhook
curl -X POST https://api.yourdomain.com/webhooks/voice/voice \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "sessionId=test&phoneNumber=%2B254700000000"

# Verify XML response
```

## Monitoring and Maintenance

### 1. Application Monitoring
```bash
# Install monitoring tools
npm install -g pm2-logrotate

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# Monitor processes
pm2 monit
pm2 status
```

### 2. Database Maintenance
```sql
-- Create backup script
#!/bin/bash
pg_dump -h localhost -U soundsteps_user soundsteps_prod > backup_$(date +%Y%m%d_%H%M%S).sql
find /backups/ -name "*.sql" -mtime +7 -delete

-- Add to crontab
crontab -e
0 2 * * * /opt/soundsteps/backup.sh
```

### 3. SSL Certificate Renewal
```bash
# Add to crontab
0 12 * * * /usr/bin/certbot renew --quiet
```

### 4. Health Checks
```bash
# Create health check script
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" https://api.yourdomain.com/health)
if [ $response -ne 200 ]; then
    echo "API is down, restarting..."
    pm2 restart soundsteps-api
    # Send alert email/SMS
fi
```

## Performance Optimization

### 1. Database Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_sessions_caller_phone ON sessions(caller_phone);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_lessons_active ON lessons(is_active);
CREATE INDEX idx_quiz_results_session_id ON quiz_results(session_id);

-- Enable PostgreSQL performance monitoring
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
```

### 2. Application Caching
```javascript
// Add Redis for session caching
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache frequently accessed data
const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, ttl, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

### 3. CDN Configuration
```bash
# Configure CloudFront or similar CDN for audio files
# Update audio URLs to use CDN endpoints
https://cdn.yourdomain.com/audio/lesson-1.mp3
```

## Security Hardening

### 1. Server Security
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Disable unused services
sudo systemctl disable apache2
sudo systemctl stop apache2
```

### 2. Application Security
```javascript
// Add security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

### 3. Database Security
```sql
-- Create read-only user for reporting
CREATE USER soundsteps_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE soundsteps_prod TO soundsteps_readonly;
GRANT USAGE ON SCHEMA public TO soundsteps_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO soundsteps_readonly;
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U soundsteps_user -d soundsteps_prod

# Check logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### 2. Africa's Talking Webhook Issues
```bash
# Test webhook connectivity
curl -X POST https://api.yourdomain.com/webhooks/voice/voice \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "sessionId=test&phoneNumber=%2B254700000000"

# Check webhook logs
pm2 logs soundsteps-api --lines 100
```

#### 3. SSL Certificate Issues
```bash
# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/api.yourdomain.com/cert.pem -noout -dates

# Renew certificate
sudo certbot renew --force-renewal
```

#### 4. Application Performance Issues
```bash
# Monitor resource usage
top
htop
iotop

# Check PM2 status
pm2 status
pm2 monit

# Restart application
pm2 restart soundsteps-api
```

### Log Analysis
```bash
# View application logs
pm2 logs soundsteps-api

# Search for errors
grep -i error /var/log/soundsteps/error.log

# Monitor real-time logs
tail -f /var/log/soundsteps/combined.log
```

## Rollback Procedures

### 1. Application Rollback
```bash
# Keep previous version available
cd /opt/soundsteps
git tag v1.0.0  # Tag current version
git checkout previous-stable-commit

# Rebuild and restart
npm run build
pm2 restart soundsteps-api
```

### 2. Database Rollback  
```bash
# Restore from backup
psql -h localhost -U soundsteps_user -d soundsteps_prod < backup_20240101_120000.sql
```

### 3. DNS Rollback
```bash
# Update DNS to point to previous server
# This depends on your DNS provider
```

This deployment guide provides comprehensive instructions for deploying SoundSteps to production environments with proper security, monitoring, and maintenance procedures.