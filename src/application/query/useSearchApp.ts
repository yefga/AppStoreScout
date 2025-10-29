import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppRepoImpl } from '../../data/repositories/AppRepoImpl';
import { PlatformKind } from '../../domain/entities/AppItem';

const repo = new AppRepoImpl();

export function useSearchApps(term: string, country: string, platforms: PlatformKind[]) {
    const [pages, setPages] = useState<{ items: any[]; totalCount: number }[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const abortRef = useRef<AbortController | null>(null);

    const items = useMemo(() => pages.flatMap(p => p.items), [pages]);
    const total = pages.length > 0 ? pages[0].totalCount : 0;
    const hasNextPage = items.length < total;

    const fetchPage = useCallback(async (offset: number) => {
        if (isFetching) return;
        setIsFetching(true); setError(null);
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        try {
            if (term.length > 3) {
                const data = await repo.search({ term, country, platforms, limit: 10, offset }, controller.signal);
                setPages(prev => [...prev, data]);
            }

        } catch (e) { setError(e); }
        finally { setIsFetching(false); }
    }, [isFetching, term, country, platforms]);

    const refetch = useCallback(async () => {
        setIsRefreshing(true); setError(null);
        setPages([]);
        try { await fetchPage(0); } finally { setIsRefreshing(false); }
    }, [fetchPage]);

    useEffect(() => {
        if (term.trim().length === 0) { setPages([]); return; }
        setPages([]); fetchPage(0);
    }, [term, country, JSON.stringify(platforms)]);

    const fetchNextPage = useCallback(() => {
        if (hasNextPage && !isFetching) fetchPage(items.length);
    }, [hasNextPage, isFetching, items.length, fetchPage]);

    return { items, isFetching, isRefreshing, fetchNextPage, hasNextPage, refetch, error };
}