/**
 * src/store/auth.store.ts
 *
 * Client-side auth state. The source of truth for who the current user is.
 * Populated by useAuth hook on mount via AuthService.onAuthStateChange.
 */

import { create } from 'zustand';
import type { User } from '@types';

interface AuthState {
  user:          User | null;
  isGuest:       boolean;
  isHydrated:    boolean;  // true once we've resolved the initial session

  // Actions
  setUser:       (user: User | null) => void;
  setGuest:      (isGuest: boolean) => void;
  setHydrated:   () => void;
  signOut:       () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:       null,
  isGuest:    false,
  isHydrated: false,

  setUser:    (user)    => set({ user }),
  setGuest:   (isGuest) => set({ isGuest }),
  setHydrated:()        => set({ isHydrated: true }),
  signOut:    ()        => set({ user: null, isGuest: false }),
}));

// Convenience selectors (avoids inline arrow functions in components)
export const selectUser      = (s: AuthState) => s.user;
export const selectIsGuest   = (s: AuthState) => s.isGuest;
export const selectIsAuthed  = (s: AuthState) => s.user !== null;
export const selectHydrated  = (s: AuthState) => s.isHydrated;
