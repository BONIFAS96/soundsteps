export const CONFIG = {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    APP_NAME: 'SoundSteps Companion',
    APP_VERSION: '1.0.0',

    // Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'auth_token',
        USER_DATA: 'user_data',
        THEME: 'app_theme',
    },

    // API Endpoints
    ENDPOINTS: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LESSONS: '/lessons',
        SESSIONS: '/sessions',
    },
};