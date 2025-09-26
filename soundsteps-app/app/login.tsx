import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { colors, typography, spacing, shadows } from '@/styles/theme';
import type { LoginCredentials } from '@/types';

const schema = yup.object().shape({
    email: yup.string().email('Please enter a valid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoginLoading, loginError, isAuthenticated } = useAuth();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? colors.dark : colors.light;

    const { control, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({
        resolver: yupResolver(schema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, router]);

    const onSubmit = async (data: LoginCredentials) => {
        try {
            await login(data);
            router.replace('/dashboard');
        } catch (error) {
            Alert.alert(
                'Login Failed',
                error instanceof Error ? error.message : 'An error occurred during login'
            );
        }
    };

    const styles = createStyles(theme);
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.backButtonText, { color: theme.primary }]}>
                                ← Back
                            </Text>
                        </TouchableOpacity>

                        <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Sign in to SoundSteps Companion
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                backgroundColor: theme.surface,
                                                borderColor: errors.email ? theme.error : theme.border,
                                                color: theme.text
                                            }
                                        ]}
                                        placeholder="Enter your email"
                                        placeholderTextColor={theme.textSecondary}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                )}
                            />
                            {errors.email && (
                                <Text style={[styles.errorText, { color: theme.error }]}>
                                    {errors.email.message}
                                </Text>
                            )}
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                backgroundColor: theme.surface,
                                                borderColor: errors.password ? theme.error : theme.border,
                                                color: theme.text
                                            }
                                        ]}
                                        placeholder="Enter your password"
                                        placeholderTextColor={theme.textSecondary}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        secureTextEntry
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                )}
                            />
                            {errors.password && (
                                <Text style={[styles.errorText, { color: theme.error }]}>
                                    {errors.password.message}
                                </Text>
                            )}
                        </View>

                        {/* Login Error */}
                        {loginError && (
                            <Text style={[styles.errorText, { color: theme.error, textAlign: 'center' }]}>
                                {loginError instanceof Error ? loginError.message : 'Login failed'}
                            </Text>
                        )}

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[
                                styles.loginButton,
                                shadows.medium,
                                { backgroundColor: theme.primary },
                                isLoginLoading && styles.loginButtonDisabled
                            ]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isLoginLoading}
                        >
                            <Text style={[styles.loginButtonText, { color: theme.background }]}>
                                {isLoginLoading ? 'Signing In...' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>

                        {/* Demo Credentials */}
                        <View style={styles.demoCredentials}>
                            <Text style={[styles.demoTitle, { color: theme.textSecondary }]}>
                                Demo Credentials:
                            </Text>
                            <Text style={[styles.demoText, { color: theme.textSecondary }]}>
                                Email: teacher@soundsteps.com
                            </Text>
                            <Text style={[styles.demoText, { color: theme.textSecondary }]}>
                                Password: password
                            </Text>
                        </View>

                        {/* Registration Link */}
                        <View style={styles.signUpContainer}>
                            <Text style={[styles.signUpText, { color: theme.textSecondary }]}>
                                Don&apos;t have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/register-user')}>
                                <Text style={[styles.signUpLink, { color: theme.primary }]}>
                                    Create Teacher Account
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: spacing.lg,
    },
    backButtonText: {
        ...typography.body,
        fontWeight: '500',
    },
    title: {
        ...typography.title1,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        textAlign: 'center',
    },
    form: {
        gap: spacing.lg,
    },
    inputGroup: {
        gap: spacing.sm,
    },
    label: {
        ...typography.headline,
    },
    input: {
        ...typography.body,
        padding: spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        minHeight: 50,
    },
    errorText: {
        ...typography.footnote,
    },
    loginButton: {
        padding: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        minHeight: 50,
        justifyContent: 'center',
        marginTop: spacing.md,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        ...typography.headline,
        fontWeight: '600',
    },
    demoCredentials: {
        alignItems: 'center',
        marginTop: spacing.xl,
        padding: spacing.md,
        borderRadius: 8,
        backgroundColor: theme.surface,
    },
    demoTitle: {
        ...typography.footnote,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    demoText: {
        ...typography.footnote,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    signUpText: {
        ...typography.body,
    },
    signUpLink: {
        ...typography.body,
        fontWeight: '600',
    },
});