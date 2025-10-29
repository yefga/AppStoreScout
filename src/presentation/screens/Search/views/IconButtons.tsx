import React, { memo } from 'react';
import {
    Pressable,
    StyleSheet,
    Platform,
} from 'react-native';
import { SFSymbol } from 'react-native-sfsymbols';

const ICON_SIZE = 16;
const ICON_FRAME = 32;
const HIT_SLOP = { top: 10, right: 10, bottom: 10, left: 10 } as const;

export const IconButton = memo(function IconButton({
    name,
    label,
    onPress,
}: {
    name: string;
    label: string;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            hitSlop={HIT_SLOP}
            style={styles.iconBtn}
        >
            <SFSymbol
                name={name}
                weight="semibold"
                scale="large"
                color="black"
                size={ICON_SIZE}
                resizeMode="center"
                multicolor={false}
                style={styles.iconFrame}
            />
        </Pressable>
    );
});

const styles = StyleSheet.create({

    iconBtn: {
        height: ICON_FRAME,
        width: ICON_FRAME,
        borderRadius: ICON_FRAME / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconFrame: { width: ICON_FRAME, height: ICON_FRAME },
    iconTxt: {
        fontSize: 20,
        color: '#1B1C1F',
    }
});
