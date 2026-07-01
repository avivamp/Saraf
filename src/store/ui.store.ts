/**
 * src/store/ui.store.ts
 *
 * Ephemeral UI state. Nothing here is persisted.
 */

import { create } from 'zustand';
import type { AuthModalMode, ToastMessage, ProductCategory, SuccessInfo } from '@types';

interface UIState {
  // Category filter
  activeCategory: ProductCategory | 'All';
  setActiveCategory: (cat: ProductCategory | 'All') => void;

  // Auth sheet
  authMode:     AuthModalMode;
  authVisible:  boolean;
  authContext:  'checkout' | null;
  openAuth:     (mode?: AuthModalMode, context?: 'checkout') => void;
  closeAuth:    () => void;
  setAuthMode:  (mode: AuthModalMode) => void;

  // Success overlay
  successInfo:  SuccessInfo | null;
  showSuccess:  (info: SuccessInfo) => void;
  clearSuccess: () => void;

  // Toast queue
  toasts:    ToastMessage[];
  pushToast: (text: string, type?: ToastMessage['type']) => void;
  popToast:  (id: string) => void;
}

let _toastSeq = 0;

export const useUIStore = create<UIState>((set) => ({
  activeCategory: 'All',
  setActiveCategory: (cat) => set({ activeCategory: cat }),

  authMode:    'choice',
  authVisible: false,
  authContext: null,
  openAuth: (mode = 'choice', context) =>
    set({ authVisible: true, authMode: mode, authContext: context ?? null }),
  closeAuth: () => set({ authVisible: false, authContext: null }),
  setAuthMode: (mode) => set({ authMode: mode }),

  successInfo:  null,
  showSuccess:  (info) => set({ successInfo: info }),
  clearSuccess: ()     => set({ successInfo: null }),

  toasts: [],
  pushToast: (text, type = 'info') => {
    const id = String(++_toastSeq);
    set((s) => ({ toasts: [...s.toasts, { id, text, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2200);
  },
  popToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
