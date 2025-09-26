import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { colors, typography, spacing, shadows } from '@/styles/theme';

export default function WelcomeScreen() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? colors.dark : colors.light;

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, router]);

    const styles = createStyles(theme);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
            </SafeAreaView>
        );
    }

    const handleSignIn = () => {
        router.push('/login');
    };

    const handleSignUp = () => {
        router.push('/register-user');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.logoContainer}>
                        <View style={[styles.logoCircle, { backgroundColor: theme.primary }]}>
                            <Text style={[styles.logoText, { color: theme.background }]}>SS</Text>
                        </View>
                    </View>

                    <Text style={[styles.title, { color: theme.text }]}>
                        Welcome to SoundSteps
                    </Text>

                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Empowering teachers to create accessible audio-based learning experiences
                        for visually impaired and low-literacy learners
                    </Text>
                </View>

                {/* Features Section */}
                <View style={styles.featuresSection}>
                    <View style={styles.featureRow}>
                        <View style={[styles.featureIcon, { backgroundColor: theme.success + '20' }]}>
                            <Text style={[styles.featureIconText, { color: theme.success }]}>📞</Text>
                        </View>
                        <Text style={[styles.featureText, { color: theme.text }]}>
                            Monitor IVR lessons in real-time
                        </Text>
                    </View>

                    <View style={styles.featureRow}>
                        <View style={[styles.featureIcon, { backgroundColor: theme.primary + '20' }]}>
                            <Text style={[styles.featureIconText, { color: theme.primary }]}>📊</Text>
                        </View>
                        <Text style={[styles.featureText, { color: theme.text }]}>
                            Track student progress and analytics
                        </Text>
                    </View>

                    <View style={styles.featureRow}>
                        <View style={[styles.featureIcon, { backgroundColor: theme.secondary + '20' }]}>
                            <Text style={[styles.featureIconText, { color: theme.secondary }]}>🎯</Text>
                        </View>
                        <Text style={[styles.featureText, { color: theme.text }]}>
                            Create and manage interactive lessons
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            shadows.medium,
                            { backgroundColor: theme.primary }
                        ]}
                        onPress={handleSignIn}
                    >
                        <Text style={[styles.primaryButtonText, { color: theme.background }]}>
                            Sign In
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.secondaryButton,
                            { borderColor: theme.border, backgroundColor: theme.surface }
                        ]}
                        onPress={handleSignUp}
                    >
                        <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                            Create Teacher Account
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                        Join educators making learning accessible for everyone
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        justifyContent: 'space-between',
    },
    heroSection: {
        alignItems: 'center',
        marginTop: spacing.xxl,
    },
    logoContainer: {
        marginBottom: spacing.xl,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        ...typography.title1,
        fontWeight: '700',
    },
    title: {
        ...typography.title1,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    subtitle: {
        ...typography.body,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: spacing.md,
    },
    featuresSection: {
        gap: spacing.lg,
        paddingVertical: spacing.xl,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    featureIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureIconText: {
        fontSize: 18,
    },
    featureText: {
        ...typography.body,
        flex: 1,
        lineHeight: 22,
    },
    actionSection: {
        gap: spacing.md,
    },
    primaryButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: 12,
        alignItems: 'center',
        minHeight: 52,
        justifyContent: 'center',
    },
    primaryButtonText: {
        ...typography.headline,
        fontWeight: '600',
    },
    secondaryButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        minHeight: 52,
        justifyContent: 'center',
    },
    secondaryButtonText: {
        ...typography.headline,
        fontWeight: '500',
    },
    footer: {
        alignItems: 'center',
        paddingTop: spacing.lg,
    },
    footerText: {
        ...typography.footnote,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...typography.body,
    },
});