import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '@/api';
import { CONFIG } from '../utils/config';
import type { User, LoginCredentials } from '@/types';

export const useAuth = () => {
    const [isInitializing, setIsInitializing] = useState(true);
    const queryClient = useQueryClient();

    // Check if user is authenticated
    const { data: user, isLoading } = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: async (): Promise<User | null> => {
            try {
                const token = await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
                const userData = await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.USER_DATA);

                if (token && userData) {
                    return JSON.parse(userData);
                }
                return null;
            } catch (error) {
                console.error('Error retrieving auth data:', error);
                return null;
            }
        },
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: authAPI.login,
        onSuccess: async (data) => {
            await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.token);
            await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
            queryClient.setQueryData(['auth', 'user'], data.user);
        },
    });

    // Registration mutation
    const registerMutation = useMutation({
        mutationFn: authAPI.register,
        onSuccess: async (data) => {
            await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.token);
            await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
            queryClient.setQueryData(['auth', 'user'], data.user);
        },
    });

    // Logout function
    const logout = async () => {
        await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.USER_DATA);
        queryClient.setQueryData(['auth', 'user'], null);
        queryClient.clear();
    };

    const login = (credentials: LoginCredentials) => {
        return loginMutation.mutateAsync(credentials);
    };

    const register = (registrationData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        school: string;
        password: string;
    }) => {
        return registerMutation.mutateAsync(registrationData);
    };

    useEffect(() => {
        // Wait for initial auth check to complete
        if (!isLoading) {
            setIsInitializing(false);
        }
    }, [isLoading]);

    return {
        user,
        isAuthenticated: !!user,
        isLoading: isInitializing || isLoading,
        isLoginLoading: loginMutation.isPending,
        isRegisterLoading: registerMutation.isPending,
        loginError: loginMutation.error,
        registerError: registerMutation.error,
        login,
        register,
        logout,
    };
};