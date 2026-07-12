/**
 * src/hooks/useAuth.ts
 *
 * Bootstraps the auth state from Supabase and exposes sign-in/up/out actions.
 * This hook owns the side effects; components stay declarative.
 */

import { useEffect, useCallback } from 'react';
import { AuthService } from '@services/auth.service';
import { CartService } from '@services/cart.service';
import { useAuthStore } from '@store/auth.store';
import { useCartStore } from '@store/cart.store';
import { useUIStore } from '@store/ui.store';

export function useAuth() {
  const { user, setUser, setGuest, setHydrated, signOut: _signOut } = useAuthStore();
  const { restore, clear }                                           = useCartStore();
  const { pushToast }                                                = useUIStore();

  // ── Bootstrap: resolve session once on mount ─────────────────────────
  useEffect(() => {
    AuthService.getSession().then((s) => {
      setUser(s?.user ?? null);
      setHydrated();
    });

    const { data: listener } = AuthService.onAuthStateChange((u) => {
      setUser(u);
      if (!u) clear(); // clear in-memory cart on sign-out
    });

    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Cart restore when user becomes known ─────────────────────────────
  useEffect(() => {
    if (!user) return;
    CartService.load(user.id)
      .then((savedLines) => {
        if (savedLines.length) restore(savedLines);
      })
      .catch(() => { /* non-fatal */ });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ──────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    const result = await AuthService.signIn(email, password);
    if (!result.data) return result;
    setUser(result.data.user);
    pushToast(`Welcome back!`);
    return result;
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const result = await AuthService.signUp(email, password, fullName);
    if (!result.data) return result;
    if (!result.data.requiresConfirmation) {
      setUser(result.data.user);
    }
    return result;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => {
    await AuthService.signOut();
    _signOut();
    clear();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const continueAsGuest = useCallback(() => {
    setGuest(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { user, signIn, signUp, signOut, continueAsGuest };
}
