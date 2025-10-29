import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { AppItem } from '../../domain/entities/AppItem';
import { tokens } from '../theme/token';
import { useTranslation } from 'react-i18next';
import { SFSymbol } from 'react-native-sfsymbols';

type Props = {
    item: AppItem;
    onOpen: (it: AppItem) => void;
    bookmarked: boolean;
    onToggleBookmark?: (it: AppItem) => void;   // ← now optional
    showBookmarkButton?: boolean;               // ← new (default true)
};

const AppListItem = ({
    item,
    onOpen,
    bookmarked,
    onToggleBookmark,
    showBookmarkButton = true,                  // ← default
}: Props) => {
    const { t } = useTranslation();
    return (
        <View style={styles.card}>
            <Image source={{ uri: item.iconUrl }} style={styles.icon} />
            <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.sub} numberOfLines={1}>{item.seller}</Text>
                <Text style={styles.sub} numberOfLines={1}>{item.genres.join(' • ')}</Text>
            </View>

            <View style={styles.actions}>
                <Pressable onPress={() => onOpen(item)} style={[styles.button, { backgroundColor: tokens.color.line }]}>
                    <Text style={styles.buttonText}>{t('search.open')}</Text>
                </Pressable>

                {showBookmarkButton && onToggleBookmark && (                 /* ← conditional */
                    <Pressable
                        onPress={() => onToggleBookmark(item)}
                        style={[
                            styles.button,
                            bookmarked ? { backgroundColor: tokens.color.danger } : { backgroundColor: tokens.color.accent },
                        ]}
                        accessibilityLabel={
                            bookmarked ? t('bookmarks.remove', 'Remove bookmark')
                                : t('bookmarks.add', 'Add bookmark')
                        }
                        accessibilityRole="button"
                    >
                        <SFSymbol
                            name={bookmarked ? 'bookmark.fill' : 'bookmark'}
                            weight="semibold"
                            scale="large"
                            color={tokens.color.bg}
                            size={16}
                            resizeMode="center"
                            multicolor={false}
                            style={{ width: 32, height: 32 }}
                        />
                    </Pressable>
                )}
            </View>
        </View>
    );
};

export default AppListItem;

const styles = StyleSheet.create({
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: tokens.color.card, marginHorizontal: 16, marginVertical: 8, borderRadius: 16, padding: 12 },
    icon: { width: 56, height: 56, borderRadius: 14, marginRight: 12 },
    name: { color: tokens.color.text, fontSize: 16, fontWeight: '700' },
    sub: { color: tokens.color.subtext, fontSize: 12, marginTop: 2 },
    actions: { marginLeft: 8 },
    button: { borderRadius: 12, paddingVertical: 6, paddingHorizontal: 10, marginVertical: 4, alignItems: 'center' },
    buttonText: { color: tokens.color.bg, fontSize: 12, fontWeight: '700' },
});