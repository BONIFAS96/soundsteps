import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../utils/config';
import type {
    AuthResponse,
    LoginCredentials,
    Lesson,
    Session,
    DashboardStats
} from '@/types';

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
        try {
            const response = await api.post(CONFIG.ENDPOINTS.LOGIN, credentials);
            return response.data;
        } catch (error: any) {
            if (error.response?.data?.error) {
                console.error('Login error response:', error.response.data);
                throw new Error(error.response.data.error);
            }
            throw new Error('Login failed. Please try again.');
        }
    },

    register: async (registrationData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        school: string;
        password: string;
    }): Promise<AuthResponse> => {
        try {
            // Transform the registration data to match backend expectations
            const backendData = {
                email: registrationData.email,
                password: registrationData.password,
                name: `${registrationData.firstName} ${registrationData.lastName}`,
                phone: registrationData.phone,
                school: registrationData.school,
            };

            const response = await api.post(CONFIG.ENDPOINTS.REGISTER, backendData);
            return response.data;
        } catch (error: any) {
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Registration failed. Please try again.');
        }
    },
};

// Helper function to transform backend lesson data to frontend format
const transformLessonData = (backendLesson: any): Lesson => {
    return {
        id: backendLesson.id,
        title: backendLesson.title,
        description: backendLesson.description || '',
        durationSeconds: backendLesson.durationSeconds || backendLesson.duration || 0,
        quiz: backendLesson.quiz || [], // TODO: Load quiz questions from separate endpoint
        createdBy: backendLesson.createdBy || '',
        createdAt: backendLesson.createdAt || new Date().toISOString(),
        updatedAt: backendLesson.updatedAt || new Date().toISOString(),
        isActive: backendLesson.isActive !== undefined ? backendLesson.isActive : true,
    };
};

export const lessonsAPI = {
    getAll: async (): Promise<Lesson[]> => {
        try {
            const response = await api.get(CONFIG.ENDPOINTS.LESSONS);
            // Backend returns { lessons: [...] }, we need just the array
            const lessonsData = response.data.lessons || response.data;
            
            // Transform each lesson to match frontend interface
            return Array.isArray(lessonsData) 
                ? lessonsData.map(transformLessonData)
                : [];
        } catch (error: any) {
            console.error('Lessons API Error:', error);
            if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
                throw new Error('Cannot connect to server. Please check if the backend is running.');
            }
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Failed to fetch lessons. Please try again.');
        }
    },

    getById: async (lessonId: string): Promise<Lesson> => {
        try {
            const response = await api.get(`${CONFIG.ENDPOINTS.LESSONS}/${lessonId}`);
            // Backend returns { lesson: {...} }, we need just the object
            const lessonData = response.data.lesson || response.data;
            return transformLessonData(lessonData);
        } catch (error: any) {
            console.error('Lesson API Error:', error);
            if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
                throw new Error('Cannot connect to server. Please check if the backend is running.');
            }
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Failed to fetch lesson. Please try again.');
        }
    },

    create: async (lessonData: {
        title: string;
        description: string;
        audioUrl?: string;
        durationSeconds: number; // Match backend expectation
        // Note: quiz functionality not implemented in backend yet
    }): Promise<Lesson> => {
        try {
            const response = await api.post(CONFIG.ENDPOINTS.LESSONS, lessonData);
            // Backend returns { lesson: {...} }, we need just the object
            const backendLesson = response.data.lesson || response.data;
            return transformLessonData(backendLesson);
        } catch (error: any) {
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Failed to create lesson. Please try again.');
        }
    },

    update: async (lessonId: string, lessonData: Partial<Lesson>): Promise<Lesson> => {
        try {
            const response = await api.put(`${CONFIG.ENDPOINTS.LESSONS}/${lessonId}`, lessonData);
            // Backend returns { lesson: {...} }, we need just the object
            const backendLesson = response.data.lesson || response.data;
            return transformLessonData(backendLesson);
        } catch (error: any) {
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Failed to update lesson. Please try again.');
        }
    },

    delete: async (lessonId: string): Promise<void> => {
        try {
            await api.delete(`${CONFIG.ENDPOINTS.LESSONS}/${lessonId}`);
        } catch (error: any) {
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Failed to delete lesson. Please try again.');
        }
    },
};

export const sessionsAPI = {
    getAll: async (): Promise<Session[]> => {
        try {
            const response = await api.get(CONFIG.ENDPOINTS.SESSIONS);
            return response.data;
        } catch (error: any) {
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Failed to fetch sessions. Please try again.');
        }
    },

    getById: async (sessionId: string): Promise<Session> => {
        try {
            const response = await api.get(`${CONFIG.ENDPOINTS.SESSIONS}/${sessionId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Failed to fetch session. Please try again.');
        }
    },

    getStats: async (): Promise<DashboardStats> => {
        try {
            const response = await api.get(`${CONFIG.ENDPOINTS.SESSIONS}/stats`);
            return response.data;
        } catch (error: any) {
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Failed to fetch session statistics. Please try again.');
        }
    },
};

export const dashboardAPI = {
    getStats: async (): Promise<DashboardStats> => {
        try {
            // Use the sessions stats endpoint for dashboard data
            return await sessionsAPI.getStats();
        } catch (error: any) {
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Failed to fetch dashboard statistics. Please try again.');
        }
    },
};

export default api;