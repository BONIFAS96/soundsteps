import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';
import { spacing } from '@/styles/theme';

interface QuizQuestionInputProps {
    control: any;
    index: number;
    question: any;
    onRemove: (index: number) => void;
    theme: any;
    errors?: any;
}

export default function QuizQuestionInput({
    control,
    index,
    question,
    onRemove,
    theme,
    errors
}: QuizQuestionInputProps) {
    const styles = createStyles(theme);

    return (
        <View style={[styles.questionCard, { backgroundColor: theme.surface }]}>
            {/* Question Header */}
            <View style={styles.questionHeader}>
                <Text style={[styles.questionTitle, { color: theme.text }]}>
                    Question {index + 1}
                </Text>
                <TouchableOpacity
                    onPress={() => onRemove(index)}
                    style={[styles.removeButton, { backgroundColor: theme.error }]}
                >
                    <Text style={[styles.removeButtonText, { color: theme.background }]}>×</Text>
                </TouchableOpacity>
            </View>

            {/* Question Text */}
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Question *</Text>
                <Controller
                    control={control}
                    name={`questions.${index}.question`}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.background,
                                    borderColor: errors?.questions?.[index]?.question ? theme.error : theme.border,
                                    color: theme.text
                                }
                            ]}
                            placeholder="Enter your question"
                            placeholderTextColor={theme.textSecondary}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            multiline
                        />
                    )}
                />
                {errors?.questions?.[index]?.question && (
                    <Text style={[styles.errorText, { color: theme.error }]}>
                        {errors.questions[index].question.message}
                    </Text>
                )}
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                <Text style={[styles.label, { color: theme.text }]}>Answer Options *</Text>
                {[0, 1, 2, 3].map((optionIndex) => (
                    <View key={optionIndex} style={styles.optionRow}>
                        <Controller
                            control={control}
                            name={`questions.${index}.correctAnswer`}
                            render={({ field: { onChange, value } }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.radioButton,
                                        {
                                            borderColor: theme.primary,
                                            backgroundColor: value === optionIndex ? theme.primary : 'transparent'
                                        }
                                    ]}
                                    onPress={() => onChange(optionIndex)}
                                >
                                    {value === optionIndex && (
                                        <View style={[styles.radioInner, { backgroundColor: theme.background }]} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                        <Controller
                            control={control}
                            name={`questions.${index}.options.${optionIndex}`}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[
                                        styles.optionInput,
                                        {
                                            backgroundColor: theme.background,
                                            borderColor: theme.border,
                                            color: theme.text,
                                            flex: 1
                                        }
                                    ]}
                                    placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                    placeholderTextColor={theme.textSecondary}
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                    </View>
                ))}
                {errors?.questions?.[index]?.options && (
                    <Text style={[styles.errorText, { color: theme.error }]}>
                        All options are required
                    </Text>
                )}
                {errors?.questions?.[index]?.correctAnswer !== undefined && (
                    <Text style={[styles.errorText, { color: theme.error }]}>
                        Please select the correct answer
                    </Text>
                )}
            </View>
        </View>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    questionCard: {
        borderRadius: 12,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: theme.border,
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    questionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    removeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 24,
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
        minHeight: 60,
        textAlignVertical: 'top',
    },
    optionsContainer: {
        marginBottom: spacing.md,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        marginRight: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    optionInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: 16,
        minHeight: 44,
    },
    errorText: {
        fontSize: 14,
        marginTop: spacing.xs,
    },
});