import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { colors, typography, shadows } from '@/styles/theme';

interface FloatingActionButtonProps {
    onPress: () => void;
    label?: string;
    icon?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    onPress,
    label = '+',
    icon,
}) => {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? colors.dark : colors.light;

    return (
        <TouchableOpacity
            style={[
                styles.fab,
                shadows.large,
                { backgroundColor: theme.primary }
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text style={[styles.fabText, { color: theme.background }]}>
                {icon || label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
    },
    fabText: {
        ...typography.title2,
        fontWeight: '600',
    },
});