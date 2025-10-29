// SearchBar.tsx
import React, { memo } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    Keyboard,
    Platform,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { IconButton } from './IconButtons';

type Props = {
    term: string;
    setTerm: (s: string) => void;
    paddingBottom: number;   // keep your prop so callers don't change
    isRaised: boolean;       // can still drive a small lift if you want
    onFocus: () => void;
    onBlur: () => void;
    onOpenFilter: () => void;
    enableKeyboardHandling?: boolean; // optional flag (default true)
};

export const SearchBar = memo(function SearchBar({
    term,
    setTerm,
    paddingBottom,
    isRaised,
    onFocus,
    onBlur,
    onOpenFilter,
    enableKeyboardHandling = true,
}: Props) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const Content = (
        <View
            // OUTER: absolutely positioned container that doesn't block the list
            pointerEvents="box-none"
            style={[
                styles.searchBarWrap,
                { paddingHorizontal: 20, paddingBottom, bottom: isRaised ? 320 : 0 },
            ]}
        >
            {/* INNER: the actual clickable area */}
            <View pointerEvents="auto" style={styles.searchControlsRow}>
                {/* LEFT: the search pill */}
                <View style={styles.searchBar}>
                    <Text
                        accessible
                        accessibilityLabel={t('search.iconLabel', 'Search icon')}
                        style={[styles.iconTxt, styles.fs48]}
                    >
                        ⌕
                    </Text>

                    <TextInput
                        value={term}
                        onChangeText={setTerm}
                        placeholder={t('search.placeholder', 'Search App')}
                        placeholderTextColor={'#9AA0A6'}
                        style={styles.input}
                        returnKeyType="search"
                        onSubmitEditing={Keyboard.dismiss}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        accessibilityLabel={t('search.inputLabel', 'Search field')}
                        blurOnSubmit
                    />
                </View>

                {/* RIGHT: filter button */}
                <View style={styles.filterBtnWrap}>
                    <IconButton
                        name="line.3.horizontal.decrease.circle.fill"
                        label={t('search.filter', 'Filter')}
                        onPress={onOpenFilter}
                    />
                </View>
            </View>
        </View>
    );

    if (!enableKeyboardHandling) return Content;

    // iOS: use KAV for smooth lift; Android: skip (often causes layout quirks)
    return Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={insets.top + 8}
            style={StyleSheet.absoluteFill}
            pointerEvents="box-none"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                {/* Must keep box-none so drags fall through to the list */}
                <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
                    {Content}
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
                {Content}
            </View>
        </TouchableWithoutFeedback>
    );
});

/* ------------------------------- styles ---------------------------------- */
const styles = StyleSheet.create({
    // This container is absolutely positioned so the list keeps the scroll gesture.
    searchBarWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -96,              // your original baseline
        backgroundColor: '#EDEEEF',
        paddingVertical: 16,
    },

    // row that holds the pill + the filter button
    searchControlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12, // RN 0.71+; if older, replace with margin
    },

    // the pill
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        height: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    input: {
        flex: 1,
        color: '#1B1C1F',
        fontSize: 16,
        paddingVertical: Platform.select({ ios: 12, android: 8 }),
        paddingLeft: 8,
    },
    iconTxt: { fontSize: 20, color: '#1B1C1F' },
    fs48: { fontSize: 48 },

    // make the button visually balanced with the pill
    filterBtnWrap: {
        height: 56,
        width: 56,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
});