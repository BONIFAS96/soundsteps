# SoundSteps Companion App

A React Native mobile application for teachers and administrators to manage audio-based math lessons and monitor learner progress through Africa's Talking IVR/USSD/SMS integration.

## Features

- **Secure Authentication**: Token-based login system
- **Real-time Dashboard**: View active calls, lesson statistics, and quiz performance
- **Lesson Management**: Create, edit, and manage audio lessons with interactive quizzes
- **Dark Mode Support**: Automatic theme switching based on system preferences
- **Responsive Design**: Optimized for various screen sizes and orientations

## Technology Stack

- **Framework**: React Native with Expo (managed workflow)
- **Navigation**: Expo Router with nested layouts
- **Language**: TypeScript
- **State Management**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form with Yup validation
- **Storage**: Expo SecureStore for JWT tokens
- **HTTP Client**: Axios with interceptors
- **UI Components**: Custom components with StyleSheet

## Project Structure

```
soundsteps-app/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Login screen
│   ├── dashboard.tsx            # Main dashboard
│   └── lessons/
│       ├── index.tsx            # Lessons list
│       └── new.tsx              # Lesson builder
│── components/              # Reusable UI components
│   ├── LessonCard.tsx      # Lesson display component
│   └── StatWidget.tsx      # Dashboard statistics widget
│── hooks/                   # Custom React hooks
│   ├── useAuth.ts          # Authentication management
│   └── useTheme.ts         # Theme management
│── api/                     # API client and endpoints
│   └── index.ts            # Axios configuration and mock APIs
│── styles/                  # Design system
│   └── theme.ts            # Colors, typography, spacing
│── types/                   # TypeScript definitions
│   └── index.ts            # App-wide type definitions
│── utils/
│   └── config.ts           # App configuration
├── assets/                      # Static assets
├── .env.example                 # Environment variables template
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 16.x or later
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Studio (for Android development)

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd soundsteps-app
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your API configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Run on device/simulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator  
   - Scan QR code with Expo Go app on your device

## Demo Credentials

For development and testing, use these credentials:

- **Email**: `teacher@soundsteps.com`
- **Password**: `password`

## API Integration

The app includes mock API implementations for development. Replace with actual backend endpoints:

### Endpoints

- `POST /login` - User authentication
- `GET /lessons` - Fetch all lessons
- `POST /lessons` - Create new lesson
- `GET /sessions` - Fetch user sessions
- `GET /dashboard/stats` - Dashboard statistics

### Environment Variables

```bash
# Required
EXPO_PUBLIC_API_BASE_URL=https://your-api.com

# Optional
EXPO_PUBLIC_APP_NAME="SoundSteps Companion"
EXPO_PUBLIC_APP_VERSION="1.0.0"
```

## Key Features Implementation

### Authentication Flow
- JWT token storage using Expo SecureStore
- Automatic token refresh and logout handling
- Protected routes with redirect logic

### Lesson Builder
- Dynamic form fields for quiz questions
- Audio file upload placeholder (ready for backend integration)
- Form validation with real-time feedback
- Support for multiple choice questions (2-4 options)

### Dashboard Analytics
- Real-time statistics widgets
- Pull-to-refresh functionality
- Responsive grid layout for metrics

### Theme System
- Light/dark mode support
- System preference detection
- Consistent design tokens (colors, typography, spacing)

## Development Guidelines

### Code Organization
- Components use TypeScript interfaces for props
- Consistent styling with theme system
- Custom hooks for business logic separation
- React Query for server state management

### Styling Approach
- StyleSheet.create for performance
- Theme-aware components
- Responsive design principles
- iOS Human Interface Guidelines inspired

### Error Handling
- User-friendly error messages
- Network error recovery
- Form validation feedback
- Loading states throughout

## TODO: Backend Integration

The following areas require backend integration:

1. **Authentication**: Replace mock login with actual API calls
2. **File Upload**: Implement audio file upload functionality
3. **Real-time Updates**: WebSocket integration for live statistics
4. **Push Notifications**: SMS/push notification scheduling
5. **Data Persistence**: Replace mock data with API responses


---

Built with ❤️ using React Native and Expo