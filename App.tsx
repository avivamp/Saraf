/**
 * App.tsx
 *
 * Root of the application. This file contains ONLY providers and the
 * root navigator. No business logic, no hooks, no state.
 * If you are tempted to add logic here — it belongs in a hook, store, or screen.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@navigation/AppNavigator';
import { SuccessOverlay } from '@components/layout/SuccessOverlay';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:               2,
      retryDelay:          (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <AppNavigator />
        <SuccessOverlay />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
