import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../utils/config';
import type { Theme } from '@/types';

export const useTheme = () => {
    const systemColorScheme = useColorScheme();
    const [theme, setTheme] = useState<Theme>('system');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load saved theme preference
        const loadTheme = async () => {
            try {
                const savedTheme = await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.THEME);
                if (savedTheme) {
                    setTheme(savedTheme as Theme);
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTheme();
    }, []);

    const updateTheme = async (newTheme: Theme) => {
        try {
            await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.THEME, newTheme);
            setTheme(newTheme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const isDarkMode = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');

    return {
        theme,
        isDarkMode,
        isLoading,
        updateTheme,
    };
};