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
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { StatWidget } from '@/components/StatWidget';
import { dashboardAPI } from '@/api';
import { colors, typography, spacing, shadows } from '@/styles/theme';

export default function DashboardScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? colors.dark : colors.light;

    const { data: stats, refetch, isRefetching } = useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: dashboardAPI.getStats,
    });

    const handleLogout = () => {
        logout();
        router.replace('/');
    };

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
                            Welcome back,
                        </Text>
                        <Text style={[styles.userName, { color: theme.text }]}>
                            {user?.name || 'Teacher'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: theme.surface }]}
                        onPress={handleLogout}
                    >
                        <Text style={[styles.logoutText, { color: theme.primary }]}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <StatWidget
                                title="Active Calls"
                                value={stats?.activeCalls ?? '-'}
                                subtitle="Currently in progress"
                                icon="📞"
                            />
                        </View>
                        <View style={styles.statItem}>
                            <StatWidget
                                title="Total Lessons"
                                value={stats?.totalLessons ?? '-'}
                                subtitle="Available content"
                                icon="📚"
                            />
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <StatWidget
                                title="Quiz Score"
                                value={stats?.averageQuizScore ? `${stats.averageQuizScore.toFixed(1)}%` : '-'}
                                subtitle="Average performance"
                                icon="📊"
                            />
                        </View>
                        <View style={styles.statItem}>
                            <StatWidget
                                title="Total Users"
                                value={stats?.totalUsers ?? '-'}
                                subtitle="Registered learners"
                                icon="👥"
                            />
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>

                    <TouchableOpacity
                        style={[styles.actionCard, shadows.medium, { backgroundColor: theme.card }]}
                        onPress={() => router.push('/lesson/new')}
                    >
                        <View style={styles.actionContent}>
                            <View style={[styles.actionIcon, { backgroundColor: theme.primary }]}>
                                <Text style={styles.actionIconText}>+</Text>
                            </View>
                            <View style={styles.actionText}>
                                <Text style={[styles.actionTitle, { color: theme.text }]}>Create Lesson</Text>
                                <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
                                    Upload audio and create quiz questions
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, shadows.medium, { backgroundColor: theme.card }]}
                        onPress={() => router.push('/lesson')}
                    >
                        <View style={styles.actionContent}>
                            <View style={[styles.actionIcon, { backgroundColor: theme.secondary }]}>
                                <Text style={styles.actionIconText}>📋</Text>
                            </View>
                            <View style={styles.actionText}>
                                <Text style={[styles.actionTitle, { color: theme.text }]}>Manage Lessons</Text>
                                <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
                                    View and edit existing lessons
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        paddingBottom: spacing.md,
    },
    welcomeText: {
        ...typography.body,
    },
    userName: {
        ...typography.title2,
        fontWeight: '700',
    },
    logoutButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 8,
    },
    logoutText: {
        ...typography.callout,
        fontWeight: '600',
    },
    statsGrid: {
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statItem: {
        flex: 1,
    },
    quickActions: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    sectionTitle: {
        ...typography.title3,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    actionCard: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    actionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    actionIconText: {
        fontSize: 20,
        color: 'white',
        fontWeight: '600',
    },
    actionText: {
        flex: 1,
    },
    actionTitle: {
        ...typography.headline,
        marginBottom: spacing.xs,
    },
    actionSubtitle: {
        ...typography.subheadline,
    },
});