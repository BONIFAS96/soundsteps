import { StyleSheet } from 'react-native';

export const colors = {
    light: {
        primary: '#007AFF',
        primaryDark: '#0051D5',
        secondary: '#5856D6',
        background: '#FFFFFF',
        surface: '#F2F2F7',
        card: '#FFFFFF',
        text: '#000000',
        textSecondary: '#6D6D70',
        border: '#E5E5EA',
        error: '#FF3B30',
        warning: '#FF9500',
        success: '#34C759',
        accent: '#FF2D92',
    },
    dark: {
        primary: '#0A84FF',
        primaryDark: '#0051D5',
        secondary: '#5E5CE6',
        background: '#000000',
        surface: '#1C1C1E',
        card: '#2C2C2E',
        text: '#FFFFFF',
        textSecondary: '#98989A',
        border: '#38383A',
        error: '#FF453A',
        warning: '#FF9F0A',
        success: '#32D74B',
        accent: '#FF375F',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    title1: {
        fontSize: 28,
        fontWeight: '600' as const,
        lineHeight: 34,
    },
    title2: {
        fontSize: 22,
        fontWeight: '600' as const,
        lineHeight: 28,
    },
    title3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 25,
    },
    headline: {
        fontSize: 17,
        fontWeight: '600' as const,
        lineHeight: 22,
    },
    body: {
        fontSize: 17,
        fontWeight: '400' as const,
        lineHeight: 22,
    },
    callout: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 21,
    },
    subheadline: {
        fontSize: 15,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
    footnote: {
        fontSize: 13,
        fontWeight: '400' as const,
        lineHeight: 18,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
    },
};

export const shadows = StyleSheet.create({
    small: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
});