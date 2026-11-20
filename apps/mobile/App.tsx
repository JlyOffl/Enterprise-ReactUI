import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders, createApplication, ErrorBoundary, useTheme } from '@erui/core';
import { createNativePlatform, nativeConfig } from './src/platform/nativePlatform';
import { NativeThemeSync } from './src/theme/styles';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Alert, Button, ModalHost, ToastHost } from './src/components/ui';
import { modalRegistry } from './src/modals/registry';

/**
 * Application framework - Mobile entry. Same createApplication() as web, composed with
 * React Native platform services.
 */
const app = createApplication({ platform: createNativePlatform(), config: nativeConfig });

function ThemedRoot() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <ErrorBoundary
        scope="root"
        fallback={(error, reset) => (
          <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12 }}>
            <Alert tone="danger" title="Something went wrong">{error.message}</Alert>
            <Button onPress={reset}>Try again</Button>
          </View>
        )}
      >
        <RootNavigator />
        <ModalHost registry={modalRegistry} />
        <ToastHost />
      </ErrorBoundary>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders app={app}>
          <NativeThemeSync />
          <ThemedRoot />
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
