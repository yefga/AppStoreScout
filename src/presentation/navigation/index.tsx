// Navigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import WebPreviewScreen from '../screens/WebPreview/WebPreviewScreen';
import BookmarksScreen from '../screens/Bookmarks/BookmarksScreen';
import { useOnboarding } from '../../application/state/OnboardingContext';
import { useTranslation } from 'react-i18next';
import { tokens } from '../theme/token'; // <- adjust path if needed

export type RootStackParamList = {
    Onboarding: undefined;
    Search: undefined;
    Bookmarks: undefined;
    WebPreview: { url: string; title: string };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
    const { completed } = useOnboarding();
    const { t } = useTranslation();

    return (
        <RootStack.Navigator
            screenOptions={{
                // Top bar color
                headerStyle: { backgroundColor: tokens.color.bg },
                headerBackTitle: "",
                headerTitleStyle: { color: tokens.color.text },
                headerTintColor: tokens.color.text,
                headerShadowVisible: false,
                contentStyle: { backgroundColor: tokens.color.bg },
                headerBackButtonDisplayMode: 'minimal',
                // fullScreenGestureEnabled: true,
                // gestureEnabled: true,
            }}
        >
            {!completed && (
                <RootStack.Screen
                    name="Onboarding"
                    component={OnboardingScreen}
                    options={{ headerShown: false }}
                />
            )}

            <RootStack.Screen
                name="Search"
                component={SearchScreen}
                options={{ headerShown: false }}
            />

            <RootStack.Screen
                name="Bookmarks"
                component={BookmarksScreen}
                options={{ title: t('bookmarks.title', 'Bookmarks'), fullScreenGestureEnabled: true, gestureEnabled: true }}
            />

            <RootStack.Screen
                name="WebPreview"
                component={WebPreviewScreen}
                options={({ route }) => ({
                    title: route.params.title ?? t('search.open', 'Open'),
                })}
            />
        </RootStack.Navigator>
    );
}