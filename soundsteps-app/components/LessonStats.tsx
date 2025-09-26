import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { colors, typography, spacing, shadows } from '@/styles/theme';
import type { Lesson } from '@/types';

interface LessonStatsProps {
    lessons?: Lesson[];
}

export const LessonStats: React.FC<LessonStatsProps> = ({ lessons = [] }) => {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? colors.dark : colors.light;

    const stats = React.useMemo(() => {
        // Ensure lessons is always an array
        const safeLessons = Array.isArray(lessons) ? lessons : [];

        if (safeLessons.length === 0) {
            return {
                total: 0,
                active: 0,
                inactive: 0,
                totalQuestions: 0,
                avgDuration: '0:00'
            };
        }

        const total = safeLessons.length;
        const active = safeLessons.filter(l => l && l.isActive).length;
        const inactive = total - active;
        const totalQuestions = safeLessons.reduce((sum, lesson) => sum + (lesson?.quiz?.length || 0), 0);
        const avgDuration = safeLessons.length > 0
            ? Math.round(safeLessons.reduce((sum, lesson) => sum + (lesson?.duration || 0), 0) / safeLessons.length)
            : 0;

        return {
            total,
            active,
            inactive,
            totalQuestions,
            avgDuration: Math.floor(avgDuration / 60) + ':' + (avgDuration % 60).toString().padStart(2, '0')
        };
    }, [lessons]);

    const StatCard: React.FC<{ title: string; value: string | number; subtitle: string }> = ({
        title,
        value,
        subtitle
    }) => (
        <View style={[styles.statCard, { backgroundColor: theme.card }, shadows.small]}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{value}</Text>
            <Text style={[styles.statTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.statSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Lesson Overview</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.statsScroll}
            >
                <StatCard
                    title="Total Lessons"
                    value={stats.total}
                    subtitle="Created"
                />
                <StatCard
                    title="Active"
                    value={stats.active}
                    subtitle="Published"
                />
                <StatCard
                    title="Draft"
                    value={stats.inactive}
                    subtitle="Unpublished"
                />
                <StatCard
                    title="Questions"
                    value={stats.totalQuestions}
                    subtitle="Total quiz items"
                />
                <StatCard
                    title="Avg Duration"
                    value={stats.avgDuration}
                    subtitle="Minutes"
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.md,
    },
    sectionTitle: {
        ...typography.headline,
        fontWeight: '600',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    statsScroll: {
        paddingLeft: spacing.lg,
    },
    statCard: {
        padding: spacing.md,
        borderRadius: 12,
        marginRight: spacing.md,
        minWidth: 100,
        alignItems: 'center',
    },
    statValue: {
        ...typography.title2,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    statTitle: {
        ...typography.footnote,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 2,
    },
    statSubtitle: {
        ...typography.caption,
        textAlign: 'center',
    },
});