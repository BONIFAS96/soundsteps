import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { colors, typography, spacing } from '@/styles/theme';

interface LessonFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeFilter: 'all' | 'active' | 'draft';
    onFilterChange: (filter: 'all' | 'active' | 'draft') => void;
}

export const LessonFilters: React.FC<LessonFiltersProps> = ({
    searchQuery,
    onSearchChange,
    activeFilter,
    onFilterChange,
}) => {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? colors.dark : colors.light;

    const FilterButton: React.FC<{
        title: string;
        filter: 'all' | 'active' | 'draft';
        count?: number;
    }> = ({ title, filter, count }) => {
        const isActive = activeFilter === filter;
        return (
            <TouchableOpacity
                style={[
                    styles.filterButton,
                    {
                        backgroundColor: isActive ? theme.primary : theme.surface,
                        borderColor: isActive ? theme.primary : theme.border,
                    }
                ]}
                onPress={() => onFilterChange(filter)}
            >
                <Text
                    style={[
                        styles.filterButtonText,
                        { color: isActive ? theme.background : theme.text }
                    ]}
                >
                    {title}
                    {count !== undefined && ` (${count})`}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Search Input */}
            <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
                <Text style={[styles.searchIcon, { color: theme.textSecondary }]}>⌕</Text>
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Search lessons..."
                    placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => onSearchChange('')}>
                        <Text style={[styles.clearButton, { color: theme.textSecondary }]}>×</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Buttons */}
            <View style={styles.filtersContainer}>
                <FilterButton title="All" filter="all" />
                <FilterButton title="Active" filter="active" />
                <FilterButton title="Draft" filter="draft" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
        height: 48,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        ...typography.body,
        paddingVertical: 0,
    },
    clearButton: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingLeft: spacing.sm,
    },
    filtersContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    filterButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterButtonText: {
        ...typography.footnote,
        fontWeight: '500',
    },
});