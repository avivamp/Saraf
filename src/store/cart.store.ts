/**
 * src/store/cart.store.ts
 *
 * In-memory cart state. Persisted locally via AsyncStorage (zustand/middleware).
 * Remote sync to Supabase is handled separately by useCart hook so we don't
 * couple the store to the auth state.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartLine, SelectionMap, IProduct } from '@types';

// ── Helpers ──────────────────────────────────────────────────────────────

/** Builds the composite cart line id from product + selections. */
function buildLineId(productId: string, selections: SelectionMap): string {
  const suffix = Object.values(selections)
    .map((o) => o.id)
    .sort()
    .join('-');
  return suffix ? `${productId}::${suffix}` : productId;
}

function buildVariantLabel(selections: SelectionMap): string | null {
  const parts = Object.values(selections).map((o) => o.label);
  return parts.length ? parts.join(' · ') : null;
}

function computeUnitPrice(basePrice: number, selections: SelectionMap): number {
  return (
    basePrice +
    Object.values(selections).reduce((sum, o) => sum + (o.delta ?? 0), 0)
  );
}

// ── State & actions ──────────────────────────────────────────────────────

interface CartState {
  lines: CartLine[];

  /** Add a product (with optional selections and quantity) to the cart. */
  addItem: (product: IProduct, selections: SelectionMap, quantity: number) => void;
  /** Increment qty of a line by 1. */
  increment: (lineId: string) => void;
  /** Decrement qty of a line by 1; removes the line if qty reaches 0. */
  decrement: (lineId: string) => void;
  /** Remove a line entirely. */
  remove: (lineId: string) => void;
  /** Empty the cart. */
  clear: () => void;
  /** Replace all lines (used when restoring a saved cart from Supabase). */
  restore: (lines: CartLine[]) => void;

  // Derived (computed on the fly — not stored)
  totalItems: () => number;
  subtotal:   () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

      addItem(product, selections, quantity) {
        const lineId      = buildLineId(product.id, selections);
        const unitPrice   = computeUnitPrice(product.price, selections);
        const variantLabel = buildVariantLabel(selections);

        set((state) => {
          const existing = state.lines.find((l) => l.id === lineId);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.id === lineId ? { ...l, qty: l.qty + quantity } : l,
              ),
            };
          }
          const newLine: CartLine = {
            id:           lineId,
            productId:    product.id,
            name:         product.name,
            icon:         product.icon,
            price:        unitPrice,
            qty:          quantity,
            variantLabel,
          };
          return { lines: [...state.lines, newLine] };
        });
      },

      increment(lineId) {
        set((s) => ({
          lines: s.lines.map((l) => (l.id === lineId ? { ...l, qty: l.qty + 1 } : l)),
        }));
      },

      decrement(lineId) {
        set((s) => ({
          lines: s.lines
            .map((l) => (l.id === lineId ? { ...l, qty: l.qty - 1 } : l))
            .filter((l) => l.qty > 0),
        }));
      },

      remove(lineId) {
        set((s) => ({ lines: s.lines.filter((l) => l.id !== lineId) }));
      },

      clear() { set({ lines: [] }); },

      restore(lines) { set({ lines }); },

      totalItems: () => get().lines.reduce((n, l) => n + l.qty, 0),
      subtotal:   () => get().lines.reduce((n, l) => n + l.price * l.qty, 0),
    }),
    {
      name:    'saraf-cart',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the lines array, not the computed methods
      partialize: (s) => ({ lines: s.lines }),
    },
  ),
);

// Selectors
export const selectLines      = (s: CartState) => s.lines;
export const selectTotalItems = (s: CartState) => s.totalItems();
export const selectSubtotal   = (s: CartState) => s.subtotal();
