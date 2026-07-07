/**
 * App.tsx
 *
 * Root of the application. This file contains ONLY providers and the
 * root navigator. No business logic, no hooks, no state.
 * If you are tempted to add logic here — it belongs in a hook, store, or screen.
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@navigation/AppNavigator';
import { SuccessOverlay } from '@components/layout/SuccessOverlay';
import { PushService } from '@services/push.service';
import { useAuthStore } from '@store/auth.store';
import { useUIStore } from '@store/ui.store';
import { navigationRef } from '@navigation/navigationRef';
import { ProductsService } from '@services/products.service';
import type { ProductCategory } from '@types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:               2,
      retryDelay:          (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      refetchOnWindowFocus: false,
    },
  },
});

function AppWithNotifications() {
  const user = useAuthStore((s) => s.user);

  // Register push token when user signs in
  useEffect(() => {
    if (!user) return;
    PushService.register(user.id).catch(() => {});
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle push notification taps — deep link to the right screen
  useEffect(() => {
    const unsubscribe = PushService.subscribe(async (data) => {
      if (!navigationRef.isReady()) return;
      const { setActiveCategory } = useUIStore.getState();

      switch (data.type) {
        case 'product': {
          if (!data.product_id) break;
          try {
            const product = await ProductsService.fetchById(data.product_id);
            navigationRef.navigate('CatalogTab');
            setTimeout(() => (navigationRef as any).navigate('ItemDetail', { product }), 300);
          } catch {}
          break;
        }
        case 'category': {
          if (data.category) setActiveCategory(data.category as ProductCategory | 'All');
          navigationRef.navigate('CatalogTab');
          break;
        }
        case 'order': {
          navigationRef.navigate('ProfileTab');
          setTimeout(() => (navigationRef as any).navigate('Orders'), 300);
          break;
        }
        default:
          navigationRef.navigate('ProfileTab');
          setTimeout(() => (navigationRef as any).navigate('Notifications'), 300);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <AppNavigator />
      <SuccessOverlay />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <AppWithNotifications />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
