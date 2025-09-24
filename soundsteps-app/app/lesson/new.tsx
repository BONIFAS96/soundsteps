import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { lessonsAPI } from '@/api';
import { colors, typography, spacing } from '@/styles/theme';
import type { Lesson } from '@/types';

const quizQuestionSchema = yup.object().shape({
    question: yup.string().required('Question is required'),
    options: yup.array().of(yup.string().required()).min(2, 'At least 2 options required').max(4, 'Maximum 4 options allowed'),
    correctAnswer: yup.number().min(0).required('Correct answer must be selected'),
});

const schema = yup.object().shape({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    audioUrl: yup.string().url('Must be a valid URL').required('Audio URL is required'),
    duration: yup.number().positive('Duration must be positive').required('Duration is required'),
    quiz: yup.array().of(quizQuestionSchema).min(1, 'At least one quiz question required'),
});

type LessonFormData = Omit<Lesson, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;

export default function NewLessonScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? colors.dark : colors.light;
    const queryClient = useQueryClient();

    const { control, handleSubmit, formState: { errors }, watch } = useForm<LessonFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: '',
            description: '',
            audioUrl: '',
            duration: 180, // 3 minutes default
            isActive: true,
            quiz: [
                {
                    id: '1',
                    question: '',
                    options: ['', ''],
                    correctAnswer: 0,
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'quiz',
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

    const onSubmit = (data: LessonFormData) => {
        createLessonMutation.mutate({
            ...data,
            createdBy: 'current-user', // TODO: Get from auth context
        });
    };

    const addQuizQuestion = () => {
        append({
            id: Date.now().toString(),
            question: '',
            options: ['', ''],
            correctAnswer: 0,
        });
    };

    const addQuizOption = (questionIndex: number) => {
        const currentOptions = watch(`quiz.${questionIndex}.options`);
        if (currentOptions.length < 4) {
            // This is a workaround since react-hook-form doesn't have nested field arrays
            // In a real app, you'd want to use a more sophisticated form library or custom solution
        }
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
                    <Text style={[styles.backButtonText, { color: theme.primary }]}>← Cancel</Text>
                </TouchableOpacity>

                <Text style={[styles.title, { color: theme.text }]}>New Lesson</Text>

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        { backgroundColor: theme.primary },
                        createLessonMutation.isPending && styles.saveButtonDisabled
                    ]}
                    onPress={handleSubmit(onSubmit)}
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
                    <View style={styles.form}>
                        {/* Basic Info Section */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Lesson Details</Text>

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
                                                    backgroundColor: theme.surface,
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
                                                styles.textArea,
                                                {
                                                    backgroundColor: theme.surface,
                                                    borderColor: errors.description ? theme.error : theme.border,
                                                    color: theme.text
                                                }
                                            ]}
                                            placeholder="Describe what this lesson covers"
                                            placeholderTextColor={theme.textSecondary}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            multiline
                                            numberOfLines={3}
                                        />
                                    )}
                                />
                                {errors.description && (
                                    <Text style={[styles.errorText, { color: theme.error }]}>
                                        {errors.description.message}
                                    </Text>
                                )}
                            </View>

                            {/* Audio Upload */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Audio URL *</Text>
                                <Controller
                                    control={control}
                                    name="audioUrl"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                {
                                                    backgroundColor: theme.surface,
                                                    borderColor: errors.audioUrl ? theme.error : theme.border,
                                                    color: theme.text
                                                }
                                            ]}
                                            placeholder="https://example.com/audio.mp3"
                                            placeholderTextColor={theme.textSecondary}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            keyboardType="url"
                                            autoCapitalize="none"
                                        />
                                    )}
                                />
                                {errors.audioUrl && (
                                    <Text style={[styles.errorText, { color: theme.error }]}>
                                        {errors.audioUrl.message}
                                    </Text>
                                )}

                                {/* TODO: Implement actual file upload */}
                                <TouchableOpacity
                                    style={[styles.uploadButton, { backgroundColor: theme.surface }]}
                                    onPress={() => Alert.alert('File Upload', 'File upload functionality will be implemented with backend integration')}
                                >
                                    <Text style={[styles.uploadButtonText, { color: theme.primary }]}>
                                        📁 Upload Audio File
                                    </Text>
                                </TouchableOpacity>
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
                                                    backgroundColor: theme.surface,
                                                    borderColor: errors.duration ? theme.error : theme.border,
                                                    color: theme.text
                                                }
                                            ]}
                                            placeholder="180"
                                            placeholderTextColor={theme.textSecondary}
                                            value={value?.toString() || ''}
                                            onChangeText={(text) => onChange(parseInt(text, 10) || 0)}
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

                        {/* Quiz Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Quiz Questions</Text>
                                <TouchableOpacity
                                    style={[styles.addButton, { backgroundColor: theme.primary }]}
                                    onPress={addQuizQuestion}
                                >
                                    <Text style={[styles.addButtonText, { color: theme.background }]}>+ Add Question</Text>
                                </TouchableOpacity>
                            </View>

                            {fields.map((field, questionIndex) => (
                                <View key={field.id} style={[styles.quizCard, { backgroundColor: theme.surface }]}>
                                    <View style={styles.quizCardHeader}>
                                        <Text style={[styles.quizCardTitle, { color: theme.text }]}>
                                            Question {questionIndex + 1}
                                        </Text>
                                        {fields.length > 1 && (
                                            <TouchableOpacity
                                                style={[styles.removeButton, { backgroundColor: theme.error }]}
                                                onPress={() => remove(questionIndex)}
                                            >
                                                <Text style={[styles.removeButtonText, { color: theme.background }]}>Remove</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* Question */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: theme.text }]}>Question *</Text>
                                        <Controller
                                            control={control}
                                            name={`quiz.${questionIndex}.question`}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    style={[
                                                        styles.input,
                                                        {
                                                            backgroundColor: theme.background,
                                                            borderColor: theme.border,
                                                            color: theme.text
                                                        }
                                                    ]}
                                                    placeholder="Enter the question"
                                                    placeholderTextColor={theme.textSecondary}
                                                    value={value}
                                                    onChangeText={onChange}
                                                    onBlur={onBlur}
                                                />
                                            )}
                                        />
                                    </View>

                                    {/* Options */}
                                    <Text style={[styles.label, { color: theme.text }]}>Answer Options *</Text>
                                    {watch(`quiz.${questionIndex}.options`)?.map((option, optionIndex) => (
                                        <View key={optionIndex} style={styles.optionRow}>
                                            <Controller
                                                control={control}
                                                name={`quiz.${questionIndex}.options.${optionIndex}`}
                                                render={({ field: { onChange, onBlur, value } }) => (
                                                    <TextInput
                                                        style={[
                                                            styles.optionInput,
                                                            {
                                                                backgroundColor: theme.background,
                                                                borderColor: theme.border,
                                                                color: theme.text
                                                            }
                                                        ]}
                                                        placeholder={`Option ${optionIndex + 1}`}
                                                        placeholderTextColor={theme.textSecondary}
                                                        value={value}
                                                        onChangeText={onChange}
                                                        onBlur={onBlur}
                                                    />
                                                )}
                                            />

                                            <Controller
                                                control={control}
                                                name={`quiz.${questionIndex}.correctAnswer`}
                                                render={({ field: { onChange, value } }) => (
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.correctButton,
                                                            {
                                                                backgroundColor: value === optionIndex ? theme.success : theme.border
                                                            }
                                                        ]}
                                                        onPress={() => onChange(optionIndex)}
                                                    >
                                                        <Text style={[
                                                            styles.correctButtonText,
                                                            { color: value === optionIndex ? theme.background : theme.textSecondary }
                                                        ]}>
                                                            {value === optionIndex ? '✓' : ''}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        </View>
                                    ))}
                                </View>
                            ))}
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
        paddingVertical: spacing.sm,
    },
    backButtonText: {
        ...typography.callout,
        fontWeight: '600',
    },
    title: {
        ...typography.title2,
        fontWeight: '600',
    },
    saveButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 8,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        ...typography.callout,
        fontWeight: '600',
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    form: {
        padding: spacing.lg,
        gap: spacing.xl,
    },
    section: {
        gap: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        ...typography.title3,
        fontWeight: '600',
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
        borderRadius: 8,
        borderWidth: 1,
        minHeight: 44,
    },
    textArea: {
        ...typography.body,
        padding: spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    uploadButton: {
        padding: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    uploadButtonText: {
        ...typography.callout,
        fontWeight: '600',
    },
    errorText: {
        ...typography.footnote,
    },
    addButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 8,
    },
    addButtonText: {
        ...typography.footnote,
        fontWeight: '600',
    },
    quizCard: {
        padding: spacing.md,
        borderRadius: 12,
        gap: spacing.md,
    },
    quizCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quizCardTitle: {
        ...typography.headline,
        fontWeight: '600',
    },
    removeButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 6,
    },
    removeButtonText: {
        ...typography.footnote,
        fontWeight: '600',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    optionInput: {
        ...typography.body,
        flex: 1,
        padding: spacing.sm,
        borderRadius: 6,
        borderWidth: 1,
        minHeight: 36,
    },
    correctButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    correctButtonText: {
        ...typography.footnote,
        fontWeight: '600',
    },
});