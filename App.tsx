import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingProvider } from './src/application/state/OnboardingContext';
import { BookmarkProvider } from './src/application/state/BookmarkContext';
import { AppNavigator } from './src/presentation/navigation';


const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0B0B0C',
    card: '#0F0F11',
    text: '#FFFFFF',
    border: '#232327',
    primary: '#5B8CFF',
  },
};


export default function App() {
  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <BookmarkProvider>
          <NavigationContainer theme={navTheme}>
            <AppNavigator />
          </NavigationContainer>
        </BookmarkProvider>
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}