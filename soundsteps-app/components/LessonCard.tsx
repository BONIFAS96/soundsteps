import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { colors, typography, spacing, shadows } from '@/styles/theme';
import type { Lesson } from '@/types';

interface LessonCardProps {
    lesson: Lesson;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
    lesson,
    onPress,
    onEdit,
    onDelete
}) => {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? colors.dark : colors.light;

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Lesson',
            'Are you sure you want to delete this lesson? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: onDelete
                },
            ]
        );
    };

    return (
        <TouchableOpacity
            style={[styles.container, shadows.medium, { backgroundColor: theme.card }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>{lesson.title}</Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: lesson.isActive ? theme.success : theme.textSecondary }
                    ]}>
                        <Text style={[styles.statusText, { color: theme.background }]}>
                            {lesson.isActive ? 'Active' : 'Inactive'}
                        </Text>
                    </View>
                </View>

                <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
                    {lesson.description}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.metadata}>
                        <Text style={[styles.duration, { color: theme.textSecondary }]}>
                            Duration: {formatDuration(lesson.duration)}
                        </Text>
                        <Text style={[styles.quizCount, { color: theme.textSecondary }]}>
                            {lesson.quiz.length} questions
                        </Text>
                        <Text style={[styles.dateCreated, { color: theme.textSecondary }]}>
                            Created: {new Date(lesson.createdAt || Date.now()).toLocaleDateString()}
                        </Text>
                    </View>

                    {(onEdit || onDelete) && (
                        <View style={styles.actions}>
                            {onEdit && (
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                                    onPress={onEdit}
                                >
                                    <Text style={[styles.actionText, { color: theme.background }]}>Edit</Text>
                                </TouchableOpacity>
                            )}

                            {onDelete && (
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.error }]}
                                    onPress={handleDelete}
                                >
                                    <Text style={[styles.actionText, { color: theme.background }]}>Delete</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        marginVertical: spacing.sm,
        overflow: 'hidden',
    },
    content: {
        padding: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    title: {
        ...typography.headline,
        flex: 1,
        marginRight: spacing.sm,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 12,
    },
    statusText: {
        ...typography.caption,
        fontWeight: '600',
    },
    description: {
        ...typography.body,
        marginBottom: spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metadata: {
        flex: 1,
    },
    duration: {
        ...typography.footnote,
        marginBottom: spacing.xs,
    },
    quizCount: {
        ...typography.footnote,
        marginBottom: spacing.xs,
    },
    dateCreated: {
        ...typography.footnote,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 8,
    },
    actionText: {
        ...typography.footnote,
        fontWeight: '600',
    },
});