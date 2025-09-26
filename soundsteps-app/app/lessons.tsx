import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { LessonCard } from '@/components/LessonCard';
import { LessonStats } from '@/components/LessonStats';
import { LessonFilters } from '@/components/LessonFilters';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { lessonsAPI } from '@/api';
import { colors, typography, spacing } from '@/styles/theme';

export default function LessonsScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? colors.dark : colors.light;
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeFilter, setActiveFilter] = React.useState<'all' | 'active' | 'draft'>('all');

    const { data: lessons, isLoading, error, refetch, isRefetching } = useQuery({
        queryKey: ['lessons'],
        queryFn: lessonsAPI.getAll,
        retry: 3,
        retryDelay: 1000,
    });

    // Delete lesson mutation
    const deleteLessonMutation = useMutation({
        mutationFn: lessonsAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
            Alert.alert('Success', 'Lesson deleted successfully!');
        },
        onError: (error) => {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete lesson');
        },
    });

    // Filter lessons based on search query and active filter
    const filteredLessons = React.useMemo(() => {
        if (!lessons || !Array.isArray(lessons)) return [];

        let filtered = lessons;

        // Apply status filter
        if (activeFilter === 'active') {
            filtered = filtered.filter(lesson => lesson.isActive);
        } else if (activeFilter === 'draft') {
            filtered = filtered.filter(lesson => !lesson.isActive);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(lesson =>
                lesson.title.toLowerCase().includes(query) ||
                lesson.description.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [lessons, searchQuery, activeFilter]);

    const handleCreateLesson = () => {
        router.push('/new-lesson');
    };

    const handleEditLesson = (lessonId: string) => {
        router.push({
            pathname: '/edit-lesson',
            params: { id: lessonId }
        });
    };

    const handleDeleteLesson = (lessonId: string) => {
        Alert.alert(
            'Delete Lesson',
            'Are you sure you want to delete this lesson? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteLessonMutation.mutate(lessonId),
                },
            ]
        );
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
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={[styles.errorTitle, { color: theme.error || theme.text }]}>
                            Failed to Load Lessons
                        </Text>
                        <Text style={[styles.errorSubtitle, { color: theme.textSecondary }]}>
                            {error instanceof Error ? error.message : 'Please check your connection and try again'}
                        </Text>
                        <TouchableOpacity
                            style={[styles.retryButton, { backgroundColor: theme.primary }]}
                            onPress={() => refetch()}
                        >
                            <Text style={[styles.retryButtonText, { color: theme.background }]}>
                                Try Again
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : !lessons || !Array.isArray(lessons) || lessons.length === 0 ? (
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
                    <>
                        {/* Lesson Statistics */}
                        <LessonStats lessons={Array.isArray(lessons) ? lessons : []} />

                        {/* Search and Filters */}
                        <LessonFilters
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            activeFilter={activeFilter}
                            onFilterChange={setActiveFilter}
                        />

                        {/* Lessons List */}
                        {(filteredLessons || []).length === 0 ? (
                            <View style={styles.noResultsContainer}>
                                <Text style={[styles.noResultsTitle, { color: theme.text }]}>
                                    No lessons found
                                </Text>
                                <Text style={[styles.noResultsSubtitle, { color: theme.textSecondary }]}>
                                    Try adjusting your search or filters
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.lessonsList}>
                                {(filteredLessons || []).map((lesson) => (
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
                    </>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <FloatingActionButton onPress={handleCreateLesson} />
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
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xxl,
    },
    noResultsTitle: {
        ...typography.title3,
        fontWeight: '600',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    noResultsSubtitle: {
        ...typography.body,
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xxl,
    },
    errorTitle: {
        ...typography.title2,
        fontWeight: '600',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    errorSubtitle: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    retryButton: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 12,
    },
    retryButtonText: {
        ...typography.headline,
        fontWeight: '600',
    },
});