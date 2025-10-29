import React, { memo, useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    View,
    RefreshControl,
    StyleSheet,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useNetInfo } from '@react-native-community/netinfo';

// Application
import { useSearchApps } from '../../../application/query/useSearchApp';
import { useBookmarks } from '../../../application/state/BookmarkContext';
// Entities
import { AppItem } from '../../../domain/entities/AppItem';
// Components
import ShimmerRow from '../../components/ShimmerRow';
import AppListItem from '../../components/AppListItem';
import FilterSheet, { FilterValue } from '../../components/FilterSheet';
import EmptyState from '../../components/EmptyState';
import { SearchHeader } from './views/SearchHeader';
import { SearchBar } from './views/SearchBar';
import { ImageIllustration } from '../../ui/illustration';
const SHIMMER_COUNT = 5;

/* ------------------------------ util hooks ------------------------------- */
function useDebouncedValue<T>(value: T, delay = 300) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

/* ----------------------- small presentational pieces ---------------------- */

const ShimmerFooter = memo(function ShimmerFooter({ visible }: { visible: boolean }) {
    if (!visible) return null;
    return (
        <View>
            {Array.from({ length: SHIMMER_COUNT }).map((_, i) => (
                <ShimmerRow key={i} />
            ))}
        </View>
    );
});


/* --------------------------------- screen -------------------------------- */
export default function SearchScreen() {
    const { t } = useTranslation();
    const nav = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [isInputFocused, setIsInputFocused] = useState(false);

    // Filters & term
    const [term, setTerm] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [filter, setFilter] = useState<FilterValue>({ country: 'US', platforms: [] });

    // Network
    const netInfo = useNetInfo();
    const isOnline = (netInfo.isConnected ?? true) && (netInfo.isInternetReachable ?? true);

    // Debounced search term to avoid spamming the query layer
    const debouncedTerm = useDebouncedValue(term, 300);

    // Data
    const { items, isFetching, isRefreshing, fetchNextPage, hasNextPage, refetch } =
        useSearchApps(debouncedTerm.trim(), filter.country, filter.platforms);

    const onEnd = useCallback(() => {
        if (hasNextPage && !isFetching) fetchNextPage();
    }, [hasNextPage, isFetching, fetchNextPage]);

    const onOpen = useCallback(
        (item: AppItem) => nav.navigate('WebPreview', { url: item.trackViewUrl }),
        [nav]
    );

    const { add, remove, items: bookmarkMap } = useBookmarks();

    const isBookmarked = useCallback(
        (id: number | string) =>
            Object.prototype.hasOwnProperty.call(bookmarkMap, String(id)),
        [bookmarkMap]
    );

    const onToggleBookmark = useCallback(
        (it: AppItem) => {
            const key = String(it.id);
            if (isBookmarked(key)) remove(key);
            else add(it);
        },
        [add, remove, isBookmarked]
    );

    const renderItem = useCallback(
        ({ item }: { item: AppItem }) => (
            <AppListItem
                item={item}
                onOpen={onOpen}
                bookmarked={isBookmarked(item.id)}
                onToggleBookmark={onToggleBookmark}
            />
        ),
        [onOpen, isBookmarked, onToggleBookmark] // ✅ update deps
    );

    const keyExtractor = useCallback((it: AppItem) => String(it.id), []);

    const showInit = debouncedTerm.trim().length === 0;
    const showEmpty = !showInit && !isFetching && items.length === 0;
    const showShimmerFooter = isFetching && items.length > 0;
    const listEmptyComponent = useMemo(
        () => (showEmpty ? (
            <EmptyState
                image={ImageIllustration.EmptySearchInitial}
                title={t('search.emptyNoResultTitle', 'No results')}
                description={t('search.emptyNoResultDesc', 'Try a different keyword or adjust your filters.')}
            />
        ) : null),
        [showEmpty, t]
    );

    const refreshControl = (
        <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={'#222'} />
    );

    const keyboardBehavior = Platform.select<'height' | 'padding' | undefined>({ ios: 'padding', android: 'height' });
    const keyboardOffset = Platform.select<number>({ ios: insets.top + 8, android: 0 }) ?? 0;

    return (
        <SafeAreaView style={[styles.container, styles.pt24]}>
            {/* Header */}
            <SearchHeader onOpenBookmarks={() => nav.navigate('Bookmarks')} />

            {/* Empty/Intro state when no search term */}
            {showInit && (
                <View style={styles.centerBlock}>
                    <EmptyState
                        image={ImageIllustration.EmptySearchInitial}
                        title={t('search.emptyInitTitle', 'Discover Your Next Favorite')}
                        description={t('search.emptyInitDesc', 'Type an app name and start exploring.')}
                    />
                </View>
            )}

            {/* Results */}
            <FlatList
                data={items}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                onEndReached={onEnd}
                onEndReachedThreshold={0.4}
                ListEmptyComponent={listEmptyComponent}
                ListFooterComponent={showShimmerFooter ? <ShimmerFooter visible /> : null}  // ← here
                refreshControl={refreshControl}
                contentContainerStyle={styles.listContent}
                style={styles.flex}
                removeClippedSubviews
                initialNumToRender={12}
                windowSize={10}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.select({ ios: 'interactive', android: 'on-drag' })}
            />
            {/* Offline state (only when absolutely nothing is shown) */}
            {!isOnline && items.length === 0 && (
                <View style={styles.centerBlock}>
                    <EmptyState
                        title={t('search.emptyOfflineTitle', 'You appear to be offline')}
                        description={t('search.emptyOfflineDesc', 'Check your connection and try again.')}
                    />
                </View>
            )}
            {/* Bottom Search Bar */}
            <SearchBar
                term={term}
                setTerm={setTerm}
                paddingBottom={insets.bottom + 12}
                isRaised={isInputFocused}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onOpenFilter={() => setFilterOpen(true)}
            />
            {/* Filters */}
            <FilterSheet
                visible={filterOpen}
                initial={filter}
                onClose={() => setFilterOpen(false)}
                onApply={(v) => {
                    setFilter(v);
                    setFilterOpen(false);
                }}
            />
        </SafeAreaView>

    );
}

/* ------------------------------- styles ---------------------------------- */
const styles = StyleSheet.create({
    flex: { flex: 1 },
    pt24: { paddingTop: 24 },

    container: {
        flex: 1,
        backgroundColor: '#EDEEEF',
    },

    fs48: { fontSize: 48 },
    centerBlock: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        marginTop: 12,
    },
    listContent: { paddingBottom: 140 },
});
