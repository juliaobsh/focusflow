import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { OnboardingModal } from '@/app/onboarding';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StoreProvider, useStore } from '@/lib/store';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Inner layout — needs access to store
function AppLayout() {
  const colorScheme = useColorScheme();
  const { settings, updateSettings, loaded } = useStore();

  const showOnboarding = loaded && !settings.onboardingComplete;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add" options={{ presentation: 'modal', title: 'New Task' }} />
        <Stack.Screen name="focus" options={{ presentation: 'fullScreenModal', headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />

      {/* Onboarding appears automatically on first launch */}
      <OnboardingModal
        visible={showOnboarding}
        onComplete={() => updateSettings({ onboardingComplete: true })}
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <AppLayout />
    </StoreProvider>
  );
}