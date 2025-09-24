import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../utils/config';
import type {
    AuthResponse,
    LoginCredentials,
    Lesson,
    Session,
    DashboardStats
} from '../types';

// Create axios instance
const api = axios.create({
    baseURL: CONFIG.API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, clear storage
            await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.USER_DATA);
        }
        return Promise.reject(error);
    }
);

// API functions
export const authAPI = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        // TODO: Replace with actual API call
        // Mock implementation for development
        if (credentials.email === 'teacher@soundsteps.com' && credentials.password === 'password') {
            const mockResponse: AuthResponse = {
                token: 'mock_jwt_token_' + Date.now(),
                user: {
                    id: '1',
                    email: credentials.email,
                    name: 'Eli Teacher',
                    role: 'teacher',
                    createdAt: new Date().toISOString(),
                },
            };
            return mockResponse;
        }
        throw new Error('Invalid credentials');
    },
};

export const lessonsAPI = {
    getAll: async (): Promise<Lesson[]> => {
        // TODO: Replace with actual API call
        // Mock implementation
        return [
            {
                id: '1',
                title: 'Basic Addition',
                description: 'Learn basic addition with numbers 1-10',
                audioUrl: 'https://example.com/audio1.mp3',
                duration: 180,
                quiz: [
                    {
                        id: '1',
                        question: 'What is 2 + 3?',
                        options: ['4', '5', '6', '7'],
                        correctAnswer: 1,
                    },
                    {
                        id: '2',
                        question: 'What is 7 + 2?',
                        options: ['8', '9', '10', '11'],
                        correctAnswer: 1,
                    },
                ],
                createdBy: '1',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true,
            },
            {
                id: '2',
                title: 'Multiplication Basics',
                description: 'Introduction to multiplication tables',
                audioUrl: 'https://example.com/audio2.mp3',
                duration: 200,
                quiz: [
                    {
                        id: '3',
                        question: 'What is 3 × 4?',
                        options: ['10', '11', '12', '13'],
                        correctAnswer: 2,
                    },
                ],
                createdBy: '1',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true,
            },
        ];
    },

    create: async (lessonData: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lesson> => {
        // TODO: Replace with actual API call
        const newLesson: Lesson = {
            ...lessonData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        return newLesson;
    },
};

export const sessionsAPI = {
    getAll: async (): Promise<Session[]> => {
        // TODO: Replace with actual API call
        return [
            {
                id: '1',
                lessonId: '1',
                userId: 'user1',
                phoneNumber: '+254712345678',
                startedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                status: 'active',
            },
            {
                id: '2',
                lessonId: '2',
                userId: 'user2',
                phoneNumber: '+254787654321',
                startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                completedAt: new Date(Date.now() - 1000 * 60 * 27).toISOString(),
                quizScore: 85,
                status: 'completed',
            },
        ];
    },
};

export const dashboardAPI = {
    getStats: async (): Promise<DashboardStats> => {
        // TODO: Replace with actual API call
        return {
            activeCalls: 12,
            totalLessons: 24,
            averageQuizScore: 78.5,
            totalUsers: 156,
        };
    },
};

export default api;