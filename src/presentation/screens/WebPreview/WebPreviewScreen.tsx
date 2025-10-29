// WebPreviewScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { tokens } from '../../theme/token';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

export default function WebPreviewScreen({ route }: NativeStackScreenProps<RootStackParamList, 'WebPreview'>) {
    return (
        <View style={styles.wrap}>
            <WebView source={{ uri: route.params.url }} style={{ flex: 1 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { flex: 1, backgroundColor: tokens.color.bg },
});