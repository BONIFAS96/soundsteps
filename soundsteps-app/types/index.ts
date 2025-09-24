export interface User {
    id: string;
    email: string;
    name: string;
    role: 'teacher' | 'admin';
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    audioUrl: string;
    duration: number; // in seconds
    quiz: QuizQuestion[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // index of correct option
}

export interface Session {
    id: string;
    lessonId: string;
    userId: string;
    phoneNumber: string;
    startedAt: string;
    completedAt?: string;
    quizScore?: number;
    status: 'active' | 'completed' | 'abandoned';
}

export interface DashboardStats {
    activeCalls: number;
    totalLessons: number;
    averageQuizScore: number;
    totalUsers: number;
}

export type Theme = 'light' | 'dark' | 'system';