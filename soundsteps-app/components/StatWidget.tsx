import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { colors, typography, spacing, shadows } from '@/styles/theme';

interface StatWidgetProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
    title,
    value,
    subtitle,
    icon
}) => {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? colors.dark : colors.light;

    return (
        <View style={[styles.container, shadows.medium, { backgroundColor: theme.card }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
                {icon && <Text style={styles.icon}>{icon}</Text>}
            </View>

            <Text style={[styles.value, { color: theme.text }]}>
                {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>

            {subtitle && (
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    {subtitle}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
        borderRadius: 12,
        minHeight: 100,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    title: {
        ...typography.subheadline,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    icon: {
        fontSize: 20,
    },
    value: {
        ...typography.title1,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.footnote,
    },
});