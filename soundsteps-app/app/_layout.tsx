import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useTheme } from '@/hooks/useTheme';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
        },
    },
});


function RootLayoutContent() {
    useFrameworkReady();
    const { isDarkMode } = useTheme();

    return (
        <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="register-user" options={{ presentation: 'modal' }} />
                <Stack.Screen name="dashboard" />
                <Stack.Screen name="lessons" />
                <Stack.Screen name="new-lesson" options={{ presentation: 'modal' }} />
            </Stack>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        </SafeAreaProvider>
    );
}

export default function RootLayout() {
    useFrameworkReady();
    return (
        <QueryClientProvider client={queryClient}>
            <RootLayoutContent />
        </QueryClientProvider>
    );
}
