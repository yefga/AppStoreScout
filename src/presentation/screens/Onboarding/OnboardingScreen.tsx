import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Image,
    FlatList,
    ViewToken,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '../../../application/state/OnboardingContext';
import { tokens } from '../../theme/token';
import { useTranslation } from 'react-i18next';
import { ImageIllustration } from '../../ui/illustration';
import { absoluteFill } from 'react-native/types_generated/Libraries/StyleSheet/StyleSheetExports';
type Slide = {
    key: string;
    title: string;
    description: string;
    image: any;
};

const SLIDES: Slide[] = [
    {
        key: 'search',
        title: 'onboarding.search.title',
        description: 'onboarding.search.desc',
        image: ImageIllustration.OnboardingStart,
    },
    {
        key: 'bookmark',
        title: 'onboarding.bookmark.title',
        description: 'onboarding.bookmark.desc',
        image: ImageIllustration.OnboardingEnd
    },
];

export default function OnboardingScreen() {
    const { t } = useTranslation();
    const { setCompleted } = useOnboarding();
    const insets = useSafeAreaInsets();
    const { width: screenWidth } = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const listRef = useRef<FlatList<Slide>>(null);

    // image size: screenWidth - 48, square
    const imgW = screenWidth - 48;
    const imgH = imgW;

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
            if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index!);
        }
    ).current;
    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

    const next = useCallback(() => {
        if (index < SLIDES.length - 1) {
            listRef.current?.scrollToIndex({ index: index + 1, animated: true });
        } else {
            setCompleted(true); // Get Started
        }
    }, [index, setCompleted]);

    const skip = useCallback(() => setCompleted(true), [setCompleted]);
    const isLast = index === SLIDES.length - 1;

    return (
        <SafeAreaView style={styles.wrap}>
            {/* Pager */}
            <FlatList
                ref={listRef}
                data={SLIDES}
                keyExtractor={(s) => s.key}
                renderItem={({ item }) => (
                    <View style={[styles.slide, { width: screenWidth }]}>
                        <Image
                            source={item.image}
                            style={{ width: imgW, height: imgH, marginBottom: 16 }}
                            resizeMode="contain"
                            accessible
                            accessibilityLabel={t(item.title)}
                        />
                        <Text style={styles.title}>{t(item.title)}</Text>
                        <Text style={styles.sub}>{t(item.description)}</Text>
                    </View>
                )}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewConfigRef}
                bounces={false}
            />

            {/* Dots */}
            <View style={styles.dotsRow}>
                {SLIDES.map((_, i) => (
                    <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
                ))}
            </View>


            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
                {/* Left side: show Skip, otherwise a spacer to keep CTA on the right */}
                {isLast ? (
                    <View style={styles.ctaPlaceholder} />
                ) : (
                    <Pressable onPress={skip} accessibilityRole="button">
                        <Text style={styles.skip}>{t('onboarding.skip', 'Skip')}</Text>
                    </Pressable>
                )}

                {/* Right-aligned CTA stays put */}
                <Pressable style={styles.cta} onPress={next} accessibilityRole="button">
                    <Text style={styles.ctaText}>
                        {isLast ? t('onboarding.start', 'Get Started') : t('onboarding.next', 'Next')}
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flex: 1,
        backgroundColor: tokens.color.bg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slide: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: tokens.color.text,
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
    },
    sub: {
        color: tokens.color.subtext,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
    },
    dotActive: {
        width: 18,
        borderRadius: 3,
        backgroundColor: tokens.color.accent,
    },
    bottomBar: {
        width: '100%',
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skip: {
        color: tokens.color.subtext,
    },
    cta: {
        backgroundColor: tokens.color.accent,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16

    },
    ctaText: { color: 'white', fontWeight: '700' },
    ctaPlaceholder: { minWidth: 132 },

});