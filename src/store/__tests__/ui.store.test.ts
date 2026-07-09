import { useUIStore } from '@store/ui.store';

describe('ui.store', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useUIStore.setState({
      activeCategory: 'All',
      authMode: 'choice',
      authVisible: false,
      authContext: null,
      successInfo: null,
      toasts: [],
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('setActiveCategory updates the active category filter', () => {
    useUIStore.getState().setActiveCategory('Cars');
    expect(useUIStore.getState().activeCategory).toBe('Cars');
  });

  test('openAuth defaults to choice mode with no context', () => {
    useUIStore.getState().openAuth();
    const state = useUIStore.getState();
    expect(state.authVisible).toBe(true);
    expect(state.authMode).toBe('choice');
    expect(state.authContext).toBeNull();
  });

  test('openAuth accepts an explicit mode and context (e.g. checkout gate)', () => {
    useUIStore.getState().openAuth('signin', 'checkout');
    const state = useUIStore.getState();
    expect(state.authMode).toBe('signin');
    expect(state.authContext).toBe('checkout');
  });

  test('closeAuth hides the sheet and clears context but leaves mode untouched', () => {
    useUIStore.getState().openAuth('signup', 'checkout');
    useUIStore.getState().closeAuth();
    const state = useUIStore.getState();
    expect(state.authVisible).toBe(false);
    expect(state.authContext).toBeNull();
    expect(state.authMode).toBe('signup');
  });

  test('setAuthMode changes the mode without affecting visibility', () => {
    useUIStore.getState().openAuth('choice');
    useUIStore.getState().setAuthMode('account');
    const state = useUIStore.getState();
    expect(state.authMode).toBe('account');
    expect(state.authVisible).toBe(true);
  });

  test('showSuccess / clearSuccess round-trip the success overlay payload', () => {
    useUIStore.getState().showSuccess({ orderId: 'ord-1', amount: 250, cardSaved: true });
    expect(useUIStore.getState().successInfo).toEqual({ orderId: 'ord-1', amount: 250, cardSaved: true });

    useUIStore.getState().clearSuccess();
    expect(useUIStore.getState().successInfo).toBeNull();
  });

  test('pushToast enqueues a toast with an id and defaults type to info', () => {
    useUIStore.getState().pushToast('Hello');
    const [toast] = useUIStore.getState().toasts;
    expect(toast).toBeDefined();
    expect(toast!.text).toBe('Hello');
    expect(toast!.type).toBe('info');
    expect(typeof toast!.id).toBe('string');
  });

  test('pushToast respects an explicit type', () => {
    useUIStore.getState().pushToast('Failed', 'error');
    expect(useUIStore.getState().toasts[0]!.type).toBe('error');
  });

  test('multiple pushToast calls append rather than replace, each with a unique id', () => {
    useUIStore.getState().pushToast('First');
    useUIStore.getState().pushToast('Second');
    const { toasts } = useUIStore.getState();
    expect(toasts).toHaveLength(2);
    expect(toasts[0]!.id).not.toBe(toasts[1]!.id);
  });

  test('popToast removes only the toast with the matching id', () => {
    useUIStore.getState().pushToast('First');
    useUIStore.getState().pushToast('Second');
    const [first, second] = useUIStore.getState().toasts;

    useUIStore.getState().popToast(first!.id);

    const remaining = useUIStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.id).toBe(second!.id);
  });

  test('pushToast auto-dismisses itself after the timeout', () => {
    useUIStore.getState().pushToast('Ephemeral');
    expect(useUIStore.getState().toasts).toHaveLength(1);

    jest.advanceTimersByTime(2200);
    expect(useUIStore.getState().toasts).toHaveLength(0);
  });
});
