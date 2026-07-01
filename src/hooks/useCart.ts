/**
 * src/hooks/useCart.ts
 *
 * Bridges the local Zustand cart store with remote Supabase persistence.
 * Components should import from this hook, not the store directly.
 */

import { useEffect, useRef } from 'react';
import { useCartStore } from '@store/cart.store';
import { useAuthStore } from '@store/auth.store';
import { CartService } from '@services/cart.service';

const DEBOUNCE_MS = 1500;

export function useCart() {
  const cart   = useCartStore();
  const user   = useAuthStore((s) => s.user);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced remote save whenever the cart changes for signed-in users
  useEffect(() => {
    if (!user) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      CartService.save(user.id, cart.lines).catch(() => { /* non-fatal */ });
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cart.lines, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    lines:       cart.lines,
    totalItems:  cart.totalItems(),
    subtotal:    cart.subtotal(),
    addItem:     cart.addItem,
    increment:   cart.increment,
    decrement:   cart.decrement,
    remove:      cart.remove,
    clear:       cart.clear,
  };
}
