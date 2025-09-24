import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { LessonCard } from '@/components/LessonCard';
import { lessonsAPI } from '@/api';
import { colors, typography, spacing } from '@/styles/theme';

export default function LessonsScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? colors.dark : colors.light;

    const { data: lessons, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['lessons'],
        queryFn: lessonsAPI.getAll,
    });

    const handleCreateLesson = () => {
        router.push('/lesson/new');
    };

    const handleEditLesson = (lessonId: string) => {
        // TODO: Navigate to edit lesson screen
        console.log('Edit lesson:', lessonId);
    };

    const handleDeleteLesson = (lessonId: string) => {
        // TODO: Implement delete lesson functionality
        console.log('Delete lesson:', lessonId);
    };

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Text style={[styles.backButtonText, { color: theme.primary }]}>← Back</Text>
                    </TouchableOpacity>

                    <Text style={[styles.title, { color: theme.text }]}>Lessons</Text>

                    <TouchableOpacity
                        style={[styles.createButton, { backgroundColor: theme.primary }]}
                        onPress={handleCreateLesson}
                    >
                        <Text style={[styles.createButtonText, { color: theme.background }]}>+ New</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                            Loading lessons...
                        </Text>
                    </View>
                ) : !lessons || lessons.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Lessons Yet</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                            Create your first lesson to get started
                        </Text>
                        <TouchableOpacity
                            style={[styles.emptyButton, { backgroundColor: theme.primary }]}
                            onPress={handleCreateLesson}
                        >
                            <Text style={[styles.emptyButtonText, { color: theme.background }]}>
                                Create Lesson
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.lessonsList}>
                        {lessons.map((lesson) => (
                            <LessonCard
                                key={lesson.id}
                                lesson={lesson}
                                onPress={() => {
                                    // TODO: Navigate to lesson detail
                                    console.log('View lesson:', lesson.id);
                                }}
                                onEdit={() => handleEditLesson(lesson.id)}
                                onDelete={() => handleDeleteLesson(lesson.id)}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
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
    createButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 8,
    },
    createButtonText: {
        ...typography.callout,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
    },
    loadingText: {
        ...typography.body,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xxl,
    },
    emptyTitle: {
        ...typography.title2,
        fontWeight: '600',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    emptySubtitle: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    emptyButton: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 12,
    },
    emptyButtonText: {
        ...typography.headline,
        fontWeight: '600',
    },
    lessonsList: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
});