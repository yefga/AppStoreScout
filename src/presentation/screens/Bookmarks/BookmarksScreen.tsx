import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBookmarks } from '../../../application/state/BookmarkContext';
import { AppItem, PlatformKind } from '../../../domain/entities/AppItem';
import EmptyState from '../../components/EmptyState';
import { tokens } from '../../theme/token';
import AppListItem from '../../components/AppListItem';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';

const DELETE_WIDTH = 88;

function BookmarksScreen() {
    const { t } = useTranslation();
    const { items, filter, setFilter, remove } = useBookmarks();

    const list = useMemo(
        () => Object.entries(items).map(([key, value]) => ({ key, value })),
        [items]
    );
    const filtered = useMemo(
        () =>
            list.filter(({ value }) =>
                filter === 'all' ? true : value.platforms.includes(filter as PlatformKind)
            ),
        [list, filter]
    );
    const isEmpty = filtered.length === 0;

    const open = (item: AppItem) => Linking.openURL(item.trackViewUrl);

    const Pill = ({ label, value }: { label: string; value: 'all' | PlatformKind }) => {
        const active = filter === value;
        return (
            <Pressable onPress={() => setFilter(value)} style={[styles.pill, active && styles.pillActive]}>
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
            </Pressable>
        );
    };

    const doDelete = useCallback(
        (rowKey: string, rowMap?: Record<string, SwipeRow<any>>) => {
            if (rowMap?.[rowKey]) rowMap[rowKey].closeRow();
            remove(rowKey);
        },
        [remove]
    );

    return (
        <View style={{ flex: 1, backgroundColor: tokens.color.bg }}>
            {/* Top bar (pills) */}
            <View style={styles.pills}>
                <Pill label={t('bookmarks.all')} value="all" />
                <Pill label={t('bookmarks.ios')} value="ios" />
                <Pill label={t('bookmarks.macos')} value="macos" />
                <Pill label={t('bookmarks.watchos')} value="watchos" />
                <Pill label={t('bookmarks.tvos')} value="tvos" />
            </View>

            {isEmpty ? (
                <View style={[styles.emptyWrap, { flex: 1, justifyContent: 'center' }]}>
                    <EmptyState title={t('bookmarks.emptyTitle')} description={t('bookmarks.emptyDesc')} />
                </View>
            ) : (
                <SwipeListView
                    data={filtered}
                    keyExtractor={(it) => it.key}

                    renderItem={(row) => (
                        <AppListItem
                            item={row.item.value}
                            onOpen={open}
                            bookmarked={false}
                            showBookmarkButton={false}
                        />
                    )}

                    renderHiddenItem={(rowData, rowMap) => {
                        const rowKey = rowData.item.key;
                        return (
                            <View style={styles.hiddenContainer}>
                                <Pressable
                                    onPress={() => doDelete(rowKey, rowMap)}
                                    style={styles.deleteButton}
                                    accessibilityRole="button"
                                    accessibilityLabel={t('bookmarks.remove', 'Remove bookmark')}
                                >
                                    <Text style={styles.deleteText}>{t('common.delete', 'Delete')}</Text>
                                </Pressable>
                            </View>
                        );
                    }}

                    rightOpenValue={-DELETE_WIDTH}
                    rightActivationValue={-DELETE_WIDTH * 0.8}
                    stopLeftSwipe={0}
                    disableLeftSwipe={false}
                    disableRightSwipe={true}
                    closeOnRowOpen={true}
                    closeOnRowPress={true}
                    closeOnScroll={true}
                    friction={15}
                    tension={80}
                    onRightAction={(data) => {
                        remove(data);
                    }}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

export default BookmarksScreen;

const styles = StyleSheet.create({
    pills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        backgroundColor: tokens.color.bg,
    },
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: tokens.color.accent,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: 'transparent',
    },
    pillActive: {
        backgroundColor: tokens.color.accent,
        borderColor: tokens.color.accent,
    },
    pillText: { color: tokens.color.accent },
    pillTextActive: { color: tokens.color.bg },
    hiddenContainer: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    deleteButton: {
        width: 88,
        height: '100%',
        backgroundColor: tokens.color.danger,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
    deleteText: { color: tokens.color.bg, fontWeight: '700' },

    listContent: { paddingBottom: 20 },
    emptyWrap: { alignItems: 'center' },
});