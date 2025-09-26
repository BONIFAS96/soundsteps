export const CONFIG = {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    APP_NAME: process.env.APP_NAME || 'SoundSteps',
    APP_VERSION: process.env.APP_VERSION || '1.0.0',

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