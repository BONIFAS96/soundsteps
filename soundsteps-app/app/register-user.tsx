import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { colors, typography, spacing, shadows } from '@/styles/theme';

interface RegistrationData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    school: string;
    password: string;
    confirmPassword: string;
}

const schema = yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Please enter a valid email').required('Email is required'),
    phone: yup.string()
        .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
        .required('Phone number is required'),
    school: yup.string().required('School/Institution name is required'),
    password: yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
        .required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
});

export default function RegisterUserScreen() {
    const router = useRouter();
    const { register, isRegisterLoading, registerError } = useAuth();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? colors.dark : colors.light;

    const { control, handleSubmit, formState: { errors } } = useForm<RegistrationData>({
        resolver: yupResolver(schema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            school: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: RegistrationData) => {
        try {
            // Remove confirmPassword from the data sent to API
            const { confirmPassword, ...registrationData } = data;

            await register(registrationData);

            Alert.alert(
                'Registration Successful!',
                'Your teacher account has been created. Welcome to SoundSteps!',
                [
                    {
                        text: 'Continue',
                        onPress: () => router.replace('/dashboard'),
                    },
                ]
            );
        } catch (error) {
            Alert.alert(
                'Registration Failed',
                error instanceof Error ? error.message : 'An error occurred during registration'
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
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
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

                            <Text style={[styles.title, { color: theme.text }]}>
                                Create Teacher Account
                            </Text>

                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                Join SoundSteps to create accessible learning experiences
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Name Row */}
                            <View style={styles.nameRow}>
                                <View style={[styles.inputGroup, styles.nameInput]}>
                                    <Text style={[styles.label, { color: theme.text }]}>First Name</Text>
                                    <Controller
                                        control={control}
                                        name="firstName"
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    {
                                                        backgroundColor: theme.surface,
                                                        borderColor: errors.firstName ? theme.error : theme.border,
                                                        color: theme.text
                                                    }
                                                ]}
                                                placeholder="John"
                                                placeholderTextColor={theme.textSecondary}
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                autoCapitalize="words"
                                            />
                                        )}
                                    />
                                    {errors.firstName && (
                                        <Text style={[styles.errorText, { color: theme.error }]}>
                                            {errors.firstName.message}
                                        </Text>
                                    )}
                                </View>

                                <View style={[styles.inputGroup, styles.nameInput]}>
                                    <Text style={[styles.label, { color: theme.text }]}>Last Name</Text>
                                    <Controller
                                        control={control}
                                        name="lastName"
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    {
                                                        backgroundColor: theme.surface,
                                                        borderColor: errors.lastName ? theme.error : theme.border,
                                                        color: theme.text
                                                    }
                                                ]}
                                                placeholder="Doe"
                                                placeholderTextColor={theme.textSecondary}
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                autoCapitalize="words"
                                            />
                                        )}
                                    />
                                    {errors.lastName && (
                                        <Text style={[styles.errorText, { color: theme.error }]}>
                                            {errors.lastName.message}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Email */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
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
                                            placeholder="john.doe@school.com"
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

                            {/* Phone */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
                                <Controller
                                    control={control}
                                    name="phone"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                {
                                                    backgroundColor: theme.surface,
                                                    borderColor: errors.phone ? theme.error : theme.border,
                                                    color: theme.text
                                                }
                                            ]}
                                            placeholder="+254712345678"
                                            placeholderTextColor={theme.textSecondary}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            keyboardType="phone-pad"
                                        />
                                    )}
                                />
                                {errors.phone && (
                                    <Text style={[styles.errorText, { color: theme.error }]}>
                                        {errors.phone.message}
                                    </Text>
                                )}
                            </View>

                            {/* School */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>School/Institution</Text>
                                <Controller
                                    control={control}
                                    name="school"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                {
                                                    backgroundColor: theme.surface,
                                                    borderColor: errors.school ? theme.error : theme.border,
                                                    color: theme.text
                                                }
                                            ]}
                                            placeholder="Nairobi Primary School"
                                            placeholderTextColor={theme.textSecondary}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            autoCapitalize="words"
                                        />
                                    )}
                                />
                                {errors.school && (
                                    <Text style={[styles.errorText, { color: theme.error }]}>
                                        {errors.school.message}
                                    </Text>
                                )}
                            </View>

                            {/* Password */}
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
                                            placeholder="Min. 6 characters with uppercase, lowercase & number"
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

                            {/* Confirm Password */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
                                <Controller
                                    control={control}
                                    name="confirmPassword"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                {
                                                    backgroundColor: theme.surface,
                                                    borderColor: errors.confirmPassword ? theme.error : theme.border,
                                                    color: theme.text
                                                }
                                            ]}
                                            placeholder="Re-enter your password"
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
                                {errors.confirmPassword && (
                                    <Text style={[styles.errorText, { color: theme.error }]}>
                                        {errors.confirmPassword.message}
                                    </Text>
                                )}
                            </View>

                            {/* Terms */}
                            <View style={styles.termsContainer}>
                                <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                                    Your information will be used to provide educational services.
                                </Text>
                            </View>

                            {/* Register Button */}
                            <TouchableOpacity
                                style={[
                                    styles.registerButton,
                                    shadows.medium,
                                    { backgroundColor: theme.primary },
                                    isRegisterLoading && styles.registerButtonDisabled
                                ]}
                                onPress={handleSubmit(onSubmit)}
                                disabled={isRegisterLoading}
                            >
                                <Text style={[styles.registerButtonText, { color: theme.background }]}>
                                    {isRegisterLoading ? 'Creating Account...' : 'Create Teacher Account'}
                                </Text>
                            </TouchableOpacity>

                            {/* Registration Error */}
                            {registerError && (
                                <Text style={[styles.errorText, { color: theme.error, textAlign: 'center', marginTop: spacing.md }]}>
                                    {registerError instanceof Error ? registerError.message : 'Registration failed'}
                                </Text>
                            )}

                            {/* Sign In Link */}
                            <View style={styles.signInContainer}>
                                <Text style={[styles.signInText, { color: theme.textSecondary }]}>
                                    Already have an account?{' '}
                                </Text>
                                <TouchableOpacity onPress={() => router.replace('/login')}>
                                    <Text style={[styles.signInLink, { color: theme.primary }]}>
                                        Sign In
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    header: {
        marginBottom: spacing.xl,
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
        ...typography.title2,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        lineHeight: 24,
    },
    form: {
        gap: spacing.lg,
    },
    nameRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    nameInput: {
        flex: 1,
    },
    inputGroup: {
        gap: spacing.sm,
    },
    label: {
        ...typography.headline,
        fontWeight: '500',
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
    termsContainer: {
        paddingVertical: spacing.sm,
    },
    termsText: {
        ...typography.footnote,
        lineHeight: 18,
        textAlign: 'center',
    },
    registerButton: {
        padding: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        minHeight: 52,
        justifyContent: 'center',
        marginTop: spacing.md,
    },
    registerButtonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        ...typography.headline,
        fontWeight: '600',
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    signInText: {
        ...typography.body,
    },
    signInLink: {
        ...typography.body,
        fontWeight: '600',
    },
});
