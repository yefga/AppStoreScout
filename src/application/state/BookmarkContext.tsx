import React, { createContext, useContext, useMemo, useState } from 'react';
import { createMMKV } from 'react-native-mmkv';
import { AppItem, PlatformKind } from '../../domain/entities/AppItem';

const storage = createMMKV();
const KEY = 'bookmarks.v1';

interface BookmarkCtx {
    items: Record<string, AppItem>;
    filter: PlatformKind | 'all';
    add: (item: AppItem) => void;
    remove: (key: string) => void;
    setFilter: (f: BookmarkCtx['filter']) => void;
}

function loadInitial(): Record<string, AppItem> {
    try { const raw = storage.getString(KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

const Ctx = createContext<BookmarkCtx | undefined>(undefined);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<Record<string, AppItem>>(loadInitial());
    const [filter, setFilter] = useState<BookmarkCtx['filter']>('all');

    const add = (item: AppItem) => {
        const key = `${item.bundleId}|${item.platforms.join(',')}`;
        const next = { ...items, [key]: item };
        storage.set(KEY, JSON.stringify(next));
        setItems(next);
    };
    const remove = (key: string) => {
        const { [key]: _, ...rest } = items; storage.set(KEY, JSON.stringify(rest)); setItems(rest);
    };

    const value = useMemo(() => ({ items, filter, add, remove, setFilter }), [items, filter]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBookmarks() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useBookmarks must be used within BookmarkProvider');
    return ctx;
}