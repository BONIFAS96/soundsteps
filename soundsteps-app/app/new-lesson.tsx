import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTheme } from '@/hooks/useTheme';
import { lessonsAPI } from '@/api';
import { colors, spacing } from '@/styles/theme';
import QuizQuestionInput from '@/components/QuizQuestionInput';

const questionSchema = yup.object().shape({
    question: yup.string().required('Question is required'),
    options: yup.array().of(yup.string().required('Option is required')).min(4, 'Must have 4 options').required(),
    correctAnswer: yup.number().min(0).max(3).required('Correct answer is required'),
});

const schema = yup.object().shape({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    duration: yup.number().positive('Duration must be positive').required('Duration is required'),
    questions: yup.array().of(questionSchema).min(1, 'At least one question is required').required('Questions are required'),
});

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface BasicLessonFormData {
    title: string;
    description: string;
    duration: number;
    questions: QuizQuestion[];
}

export default function NewLessonScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? colors.dark : colors.light;
    const queryClient = useQueryClient();

    const { control, handleSubmit, formState: { errors } } = useForm<BasicLessonFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: '',
            description: '',
            duration: 180, // 3 minutes default
            questions: [
                {
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                }
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'questions',
    });

    const createLessonMutation = useMutation({
        mutationFn: lessonsAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
            Alert.alert('Success', 'Lesson created successfully!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        },
        onError: (error) => {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create lesson');
        },
    });

    const onSubmit = (data: BasicLessonFormData) => {
        const lessonData = {
            title: data.title,
            description: data.description,
            durationSeconds: data.duration,
            questions: data.questions,
        };

        createLessonMutation.mutate(lessonData);
    };

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Text style={[styles.backButtonText, { color: theme.primary }]}>Cancel</Text>
                </TouchableOpacity>

                <Text style={[styles.title, { color: theme.text }]}>New Lesson</Text>

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        { backgroundColor: theme.primary },
                        createLessonMutation.isPending && styles.saveButtonDisabled
                    ]}
                    onPress={handleSubmit(onSubmit) as any} // Type assertion for react-hook-form compatibility
                    disabled={createLessonMutation.isPending}
                >
                    <Text style={[styles.saveButtonText, { color: theme.background }]}>
                        {createLessonMutation.isPending ? 'Saving...' : 'Save'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        {/* Basic Information */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>

                            {/* Title */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Title *</Text>
                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                {
                                                    backgroundColor: theme.background,
                                                    borderColor: errors.title ? theme.error : theme.border,
                                                    color: theme.text
                                                }
                                            ]}
                                            placeholder="Enter lesson title"
                                            placeholderTextColor={theme.textSecondary}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />
                                {errors.title && (
                                    <Text style={[styles.errorText, { color: theme.error }]}>
                                        {errors.title.message}
                                    </Text>
                                )}
                            </View>

                            {/* Description */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Description *</Text>
                                <Controller
                                    control={control}
                                    name="description"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                styles.textArea,
                                                {
                                                    backgroundColor: theme.background,
                                                    borderColor: errors.description ? theme.error : theme.border,
                                                    color: theme.text
                                                }
                                            ]}
                                            placeholder="Enter lesson description"
                                            placeholderTextColor={theme.textSecondary}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            multiline
                                            numberOfLines={4}
                                        />
                                    )}
                                />
                                {errors.description && (
                                    <Text style={[styles.errorText, { color: theme.error }]}>
                                        {errors.description.message}
                                    </Text>
                                )}
                            </View>

                            {/* Duration */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Duration (seconds) *</Text>
                                <Controller
                                    control={control}
                                    name="duration"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                {
                                                    backgroundColor: theme.background,
                                                    borderColor: errors.duration ? theme.error : theme.border,
                                                    color: theme.text
                                                }
                                            ]}
                                            placeholder="180"
                                            placeholderTextColor={theme.textSecondary}
                                            value={value?.toString()}
                                            onChangeText={(text) => onChange(parseInt(text) || 0)}
                                            onBlur={onBlur}
                                            keyboardType="numeric"
                                        />
                                    )}
                                />
                                {errors.duration && (
                                    <Text style={[styles.errorText, { color: theme.error }]}>
                                        {errors.duration.message}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Quiz Questions Section */}
                        <View style={styles.section}>
                            <View style={styles.quizHeader}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Quiz Questions</Text>
                                <TouchableOpacity
                                    style={[styles.addButton, { backgroundColor: theme.primary }]}
                                    onPress={() => append({
                                        question: '',
                                        options: ['', '', '', ''],
                                        correctAnswer: 0,
                                    })}
                                >
                                    <Text style={[styles.addButtonText, { color: theme.background }]}>
                                        + Add Question
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {fields.map((field, index) => (
                                <QuizQuestionInput
                                    key={field.id}
                                    control={control}
                                    index={index}
                                    question={field}
                                    onRemove={remove}
                                    theme={theme}
                                    errors={errors}
                                />
                            ))}

                            {errors.questions && (
                                <Text style={[styles.errorText, { color: theme.error }]}>
                                    {errors.questions.message}
                                </Text>
                            )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
    },
    backButton: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    saveButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 8,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: 14,
        marginTop: spacing.xs,
    },
    quizHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    addButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 8,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    placeholderCard: {
        padding: spacing.lg,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    placeholderText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 20,
    },
});