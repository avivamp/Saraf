jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

jest.mock('@lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

import { supabase } from '@lib/supabase';
import { AuthService } from '@services/auth.service';
import type { User, Session } from '@types';

const fakeUser = { id: 'user-1', email: 'A@Example.com', user_metadata: { full_name: 'Ada' } } as unknown as User;
const fakeSession = { access_token: 'tok' } as unknown as Session;

function stubSideEffects() {
  const upsertChain = { upsert: jest.fn().mockResolvedValue({ data: null, error: null }) };
  const insertChain = { insert: jest.fn().mockResolvedValue({ data: null, error: null }) };
  (supabase.from as jest.Mock).mockImplementation((table: string) =>
    table === 'profiles' ? upsertChain : insertChain,
  );
  (supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: null });
  return { upsertChain, insertChain };
}

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('signIn', () => {
    test('returns the Supabase error message on failure', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: {}, error: { message: 'Invalid credentials' },
      });

      const result = await AuthService.signIn('a@b.com', 'wrong');

      expect(result).toEqual({ data: null, error: 'Invalid credentials' });
    });

    test('errors when sign-in succeeds but no session is returned', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: fakeUser, session: null }, error: null,
      });

      const result = await AuthService.signIn('a@b.com', 'pw');

      expect(result.error).toBe('Sign-in succeeded but no session returned.');
    });

    test('on success returns the user/session and fires profile upsert, session log, and guest-order linking', async () => {
      stubSideEffects();
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: fakeUser, session: fakeSession }, error: null,
      });

      const result = await AuthService.signIn('a@example.com', 'pw');

      expect(result).toEqual({ data: { user: fakeUser, session: fakeSession }, error: null });
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.from).toHaveBeenCalledWith('user_sessions');
      expect(supabase.rpc).toHaveBeenCalledWith('link_guest_orders', {
        p_email: 'a@example.com',
        p_user_id: 'user-1',
      });
    });

    test('upserts the profile with full_name from user_metadata and email lower-cased as stored', async () => {
      const { upsertChain } = stubSideEffects();
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: fakeUser, session: fakeSession }, error: null,
      });

      await AuthService.signIn('a@example.com', 'pw');

      expect(upsertChain.upsert).toHaveBeenCalledWith(
        { id: 'user-1', email: 'A@Example.com', full_name: 'Ada' },
        { onConflict: 'id' },
      );
    });

    test('logs the session with the current platform', async () => {
      const { insertChain } = stubSideEffects();
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: fakeUser, session: fakeSession }, error: null,
      });

      await AuthService.signIn('a@example.com', 'pw');

      expect(insertChain.insert).toHaveBeenCalledWith({ user_id: 'user-1', platform: 'ios' });
    });
  });

  describe('signUp', () => {
    test('returns the Supabase error message on failure', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({ data: {}, error: { message: 'Email taken' } });
      const result = await AuthService.signUp('a@b.com', 'pw', 'Ada');
      expect(result).toEqual({ data: null, error: 'Email taken' });
    });

    test('errors when sign-up returns no user', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({ data: { user: null }, error: null });
      const result = await AuthService.signUp('a@b.com', 'pw', 'Ada');
      expect(result.error).toBe('Sign-up returned no user.');
    });

    test('requiresConfirmation is true and no profile is written when Supabase defers session (email confirmation on)', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: fakeUser, session: null }, error: null,
      });

      const result = await AuthService.signUp('a@example.com', 'pw', 'Ada');

      expect(result).toEqual({ data: { user: fakeUser, requiresConfirmation: true }, error: null });
      expect(supabase.from).not.toHaveBeenCalled();
    });

    test('requiresConfirmation is false and profile + guest orders are written when a session is live immediately', async () => {
      stubSideEffects();
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: fakeUser, session: fakeSession }, error: null,
      });

      const result = await AuthService.signUp('a@example.com', 'pw', 'Ada');

      expect(result.data).toEqual({ user: fakeUser, requiresConfirmation: false });
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.rpc).toHaveBeenCalledWith('link_guest_orders', {
        p_email: 'a@example.com',
        p_user_id: 'user-1',
      });
    });
  });

  test('signOut delegates to supabase.auth.signOut', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });
    await AuthService.signOut();
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  describe('getSession', () => {
    test('returns null when there is no active session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null } });
      expect(await AuthService.getSession()).toBeNull();
    });

    test('returns the user and session when one exists', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { ...fakeSession, user: fakeUser } },
      });

      const result = await AuthService.getSession();

      expect(result).toEqual({ user: fakeUser, session: { ...fakeSession, user: fakeUser } });
    });
  });

  test('onAuthStateChange extracts the user from the session for the callback', () => {
    let capturedHandler: (event: string, session: any) => void = () => {};
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((cb) => {
      capturedHandler = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    const callback = jest.fn();
    AuthService.onAuthStateChange(callback);

    capturedHandler('SIGNED_IN', { user: fakeUser });
    expect(callback).toHaveBeenCalledWith(fakeUser);

    capturedHandler('SIGNED_OUT', null);
    expect(callback).toHaveBeenCalledWith(null);
  });
});
