/**
 * src/hooks/useOrders.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrdersService } from '@services/orders.service';
import { CartService } from '@services/cart.service';
import { useCartStore } from '@store/cart.store';
import { useAuthStore } from '@store/auth.store';
import { useUIStore } from '@store/ui.store';
import type { PlaceOrderPayload } from '@types';

export function ordersQueryKey(userId: string) {
  return ['orders', userId] as const;
}

export function useOrders() {
  const user        = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const { clear }   = useCartStore();
  const { showSuccess, pushToast } = useUIStore();

  const ordersQuery = useQuery({
    queryKey:  ordersQueryKey(user?.id ?? ''),
    queryFn:   () => OrdersService.fetchByUser(user!.id),
    enabled:   !!user,
    staleTime: 1000 * 60 * 2,
  });

  const placeOrderMutation = useMutation({
    mutationFn: (payload: PlaceOrderPayload) => OrdersService.placeOrder(payload),
    onSuccess: async (orderId, variables) => {
      // Invalidate order list so history reflects new order
      await queryClient.invalidateQueries({ queryKey: ordersQueryKey(variables.userId) });

      // Clear remote cart
      void CartService.clear(variables.userId);

      // Clear in-memory cart
      clear();

      showSuccess({
        orderId,
        amount:    variables.total,
        cardSaved: variables.cardSaved,
      });
    },
    onError: (err: Error) => {
      pushToast(`Order failed: ${err.message}`, 'error');
    },
  });

  return {
    orders:       ordersQuery.data ?? [],
    isLoading:    ordersQuery.isLoading,
    isError:      ordersQuery.isError,
    refetch:      ordersQuery.refetch,
    placeOrder:   placeOrderMutation.mutate,
    isPlacing:    placeOrderMutation.isPending,
  };
}
