import {
  useAuthStore,
  selectUser,
  selectIsGuest,
  selectIsAuthed,
  selectHydrated,
} from '@store/auth.store';
import type { User } from '@types';

const fakeUser = { id: 'user-1', email: 'a@b.com' } as User;

describe('auth.store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isGuest: false, isHydrated: false });
  });

  test('starts unauthenticated, non-guest, unhydrated', () => {
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.isGuest).toBe(false);
    expect(s.isHydrated).toBe(false);
  });

  test('setUser stores the user', () => {
    useAuthStore.getState().setUser(fakeUser);
    expect(useAuthStore.getState().user).toBe(fakeUser);
  });

  test('setGuest toggles guest mode independently of user', () => {
    useAuthStore.getState().setGuest(true);
    expect(useAuthStore.getState().isGuest).toBe(true);
    expect(useAuthStore.getState().user).toBeNull();
  });

  test('setHydrated flips hydration flag to true and cannot be unset', () => {
    useAuthStore.getState().setHydrated();
    expect(useAuthStore.getState().isHydrated).toBe(true);
  });

  test('signOut clears user and guest flag but does not affect hydration', () => {
    useAuthStore.getState().setUser(fakeUser);
    useAuthStore.getState().setGuest(true);
    useAuthStore.getState().setHydrated();

    useAuthStore.getState().signOut();

    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.isGuest).toBe(false);
    expect(s.isHydrated).toBe(true);
  });

  test('selectors reflect derived state correctly', () => {
    expect(selectUser(useAuthStore.getState())).toBeNull();
    expect(selectIsGuest(useAuthStore.getState())).toBe(false);
    expect(selectIsAuthed(useAuthStore.getState())).toBe(false);
    expect(selectHydrated(useAuthStore.getState())).toBe(false);

    useAuthStore.getState().setUser(fakeUser);
    expect(selectIsAuthed(useAuthStore.getState())).toBe(true);
    expect(selectUser(useAuthStore.getState())).toBe(fakeUser);
  });
});
