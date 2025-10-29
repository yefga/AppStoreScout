import React, { createContext, useContext, useMemo, useState } from 'react';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();
const KEY = 'onboardingCompleted';

interface OnboardingCtx { completed: boolean; setCompleted: (v: boolean) => void }
const Ctx = createContext<OnboardingCtx | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [completed, setCompletedState] = useState<boolean>(storage.getBoolean(KEY) ?? false);
    const setCompleted = (v: boolean) => { storage.set(KEY, v); setCompletedState(v); };
    const value = useMemo(() => ({ completed, setCompleted }), [completed]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOnboarding() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
    return ctx;
}