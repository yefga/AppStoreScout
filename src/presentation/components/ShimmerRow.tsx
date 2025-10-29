import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { tokens } from '../theme/token';

export default function ShimmerRow() {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const loop = Animated.loop(
            Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true })
        );
        loop.start();
        return () => loop.stop();
    }, [anim]);

    const translate = anim.interpolate({ inputRange: [0, 1], outputRange: [-200, 200] });

    return (
        <View style={styles.container}>
            <View style={styles.icon} />
            <View style={styles.content}>
                <View style={styles.line} />
                <View style={[styles.line, { width: '60%' }]} />
            </View>
            <Animated.View style={[styles.shimmer, { transform: [{ translateX: translate }] }]}>
                <LinearGradient colors={['#0000', '#ffffff22', '#0000']} style={StyleSheet.absoluteFillObject} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { height: 72, backgroundColor: tokens.color.card, marginHorizontal: 16, marginVertical: 8, borderRadius: 16, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', padding: 12 },
    icon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#1C1C21' },
    content: { flex: 1, marginLeft: 12 },
    line: { height: 12, backgroundColor: '#1C1C21', borderRadius: 8, marginBottom: 8 },
    shimmer: { ...StyleSheet.absoluteFillObject },
});