import React, { memo } from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton } from './IconButtons';

export const SearchHeader = memo(function Header({
    onOpenBookmarks,
}: {
    onOpenBookmarks: () => void;
}) {
    const { t } = useTranslation();
    return (
        <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{t('search.title', 'Search App')}</Text>
            <View style={styles.headerActions}>
                <IconButton
                    name="bookmark.fill"
                    label={t('bookmarks.open', 'Open Bookmarks')}
                    onPress={onOpenBookmarks}
                />
                {/* Filter button moved to SearchBar */}
            </View>
        </View>
    );
});


/* ------------------------------- styles ---------------------------------- */
const styles = StyleSheet.create({
    /* Header */
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 34,
        fontWeight: '800',
        color: '#1B1C1F',
        letterSpacing: -0.4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 16,
    }
});
