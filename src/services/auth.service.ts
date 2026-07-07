/**
 * src/services/auth.service.ts
 *
 * All Supabase Auth operations. Returns typed results; never throws —
 * returns a discriminated union { data, error } so callers decide how to
 * present errors to the UI.
 */

import { Platform } from 'react-native';
import { supabase } from '@lib/supabase';
import type { User, Session, IProfile, IUserSession } from '@types';

type AuthResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export const AuthService = {
  /**
   * Attempt email + password sign-in.
   * On success, upserts the profile row and logs the session.
   */
  async signIn(email: string, password: string): Promise<AuthResult<{ user: User; session: Session }>> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { data: null, error: error.message };
    if (!data.user || !data.session) return { data: null, error: 'Sign-in succeeded but no session returned.' };

    // Fire-and-forget side effects — do not await so UI isn't blocked
    void AuthService._upsertProfile(data.user);
    void AuthService._logSession(data.user.id);
    void AuthService._linkGuestOrders(data.user.email ?? '', data.user.id);

    return { data: { user: data.user, session: data.session }, error: null };
  },

  /**
   * Create a new account. If email confirmation is disabled in Supabase,
   * a live session is returned immediately and the profile is written.
   * If confirmation is required, the profile write is deferred to the
   * next successful sign-in (which also calls _upsertProfile).
   */
  async signUp(
    email: string,
    password: string,
    fullName: string,
  ): Promise<AuthResult<{ user: User; requiresConfirmation: boolean }>> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { data: null, error: error.message };
    if (!data.user) return { data: null, error: 'Sign-up returned no user.' };

    const requiresConfirmation = !data.session;

    if (data.session) {
      // Session is live — safe to write profile (auth.uid() is set)
      void AuthService._upsertProfile(data.user);
      // Link any guest orders placed with this email before account creation
      void AuthService._linkGuestOrders(data.user.email ?? '', data.user.id);
    }

    return { data: { user: data.user, requiresConfirmation }, error: null };
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getSession(): Promise<{ user: User; session: Session } | null> {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    return { user: data.session.user, session: data.session };
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },

  // ── Private helpers ──────────────────────────────────────────────────

  async _upsertProfile(user: User): Promise<void> {
    const profile: Omit<IProfile, 'created_at'> = {
      id: user.id,
      email: user.email ?? '',
      full_name: (user.user_metadata?.['full_name'] as string | undefined) ?? '',
    };
    await supabase.from('profiles').upsert(profile, { onConflict: 'id' });
  },

  async _logSession(userId: string): Promise<void> {
    const entry: Omit<IUserSession, 'id' | 'signed_in_at'> = {
      user_id: userId,
      platform: Platform.OS as IUserSession['platform'],
    };
    await supabase.from('user_sessions').insert(entry);
  },

  async _linkGuestOrders(email: string, userId: string): Promise<void> {
    if (!email) return;
    // Calls the security-definer RPC which updates guest orders
    // matching the email to the new user_id — bypasses RLS safely
    await supabase.rpc('link_guest_orders', {
      p_email:   email.toLowerCase().trim(),
      p_user_id: userId,
    });
  },
} as const;
