// Filter sheet (spring + safe area floating)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Modal,
    Pressable,
    Animated,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../theme/token';
import { PlatformKind } from '../../domain/entities/AppItem';
import { useTranslation } from 'react-i18next';

export type FilterValue = { country: string; platforms: PlatformKind[] };

export default function FilterSheet(props: {
    visible: boolean;
    initial: FilterValue;
    onClose: () => void;
    onApply: (v: FilterValue) => void;
}) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const [country, setCountry] = useState(props.initial.country);
    const [platforms, setPlatforms] = useState<PlatformKind[]>(props.initial.platforms);

    const [mounted, setMounted] = useState(props.visible);
    useEffect(() => { if (props.visible) setMounted(true); }, [props.visible]);

    const [sheetH, setSheetH] = useState(0);
    const progress = useRef(new Animated.Value(0)).current;
    const backdrop = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const toValue = props.visible ? 1 : 0;

        Animated.timing(backdrop, {
            toValue,
            duration: 180,
            useNativeDriver: true,
        }).start();

        // sheet spring
        Animated.spring(progress, {
            toValue,
            damping: 18,
            stiffness: 220,
            mass: 0.9,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished && !props.visible) setMounted(false);
        });
    }, [props.visible, backdrop, progress]);

    // translateY based on measured height + bottom inset
    const translateY = useMemo(() => {
        const off = (sheetH || 1) + insets.bottom + 24; // 24px travel reserve
        return progress.interpolate({ inputRange: [0, 1], outputRange: [off, 0] });
    }, [progress, sheetH, insets.bottom]);

    function toggle(p: PlatformKind) {
        setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
    }

    if (!mounted) return null;

    return (
        <Modal
            transparent
            visible
            onRequestClose={props.onClose}
            statusBarTranslucent
        >
            {/* Backdrop */}
            <Pressable style={styles.backdrop} onPress={props.onClose}>
                <Animated.View style={[styles.backdropFill, { opacity: backdrop }]} />
            </Pressable>

            {/* Floating sheet */}
            <Animated.View
                onLayout={e => setSheetH(e.nativeEvent.layout.height)}
                style={[
                    styles.sheet,
                    {
                        transform: [{ translateY }],
                        marginBottom: insets.bottom + 12, // float above safe area
                    },
                ]}
            >
                <Text style={styles.title}>{t('search.filter')}</Text>

                <Text style={styles.label}>{t('search.country')}</Text>
                <TextInput
                    value={country}
                    onChangeText={setCountry}
                    placeholder="US"
                    placeholderTextColor={tokens.color.subtext}
                    autoCapitalize="characters"
                    style={styles.input}
                />

                <Text style={styles.label}>{t('search.platforms')}</Text>
                <View style={styles.row}>
                    {(['ios', 'macos', 'watchos', 'tvos'] as PlatformKind[]).map(p => (
                        <Pressable
                            key={p}
                            onPress={() => toggle(p)}
                            style={[styles.pill, platforms.includes(p) && styles.pillActive]}
                        >
                            <Text style={[styles.pillText, platforms.includes(p) && styles.pillTextActive]}>
                                {t(`search.${p}`)}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <Pressable onPress={() => props.onApply({ country, platforms })} style={styles.apply}>
                    <Text style={styles.applyText}>{t('search.apply')}</Text>
                </Pressable>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1 },
    backdropFill: { flex: 1, backgroundColor: '#0009' },

    // floating card-like sheet
    sheet: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 0,
        backgroundColor: tokens.color.card,
        borderRadius: 20,
        padding: 16,
        // shadow/elevation
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 12 },
            },
            android: { elevation: 12 },
        }),
    },

    title: { color: tokens.color.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
    label: { color: tokens.color.subtext, marginTop: 8 },
    input: {
        borderWidth: 1,
        borderColor: tokens.color.line,
        color: tokens.color.text,
        borderRadius: 12,
        padding: 10,
        marginTop: 6,
    },
    row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: tokens.color.line,
        marginRight: 8,
        marginBottom: 8,
    },
    pillActive: { backgroundColor: '#1C1C21', borderColor: tokens.color.accent },
    pillText: { color: tokens.color.subtext },
    pillTextActive: { color: tokens.color.text },
    apply: {
        marginTop: 16,
        backgroundColor: tokens.color.accent,
        borderRadius: 14,
        alignItems: 'center',
        padding: 12,
    },
    applyText: { color: 'white', fontWeight: '700' },
});