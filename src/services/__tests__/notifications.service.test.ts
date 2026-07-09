import { createQueryChain } from '../../test-utils/supabaseMock';

jest.mock('@lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '@lib/supabase';
import { NotificationsService } from '@services/notifications.service';

const from = supabase.from as jest.Mock;

describe('NotificationsService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('fetchForUser', () => {
    test('filters for own notifications OR broadcasts, ordered newest-first, capped at 50', async () => {
      const chain = createQueryChain({ data: [], error: null });
      from.mockReturnValue(chain);

      await NotificationsService.fetchForUser('user-1');

      expect(from).toHaveBeenCalledWith('notifications');
      expect(chain.or).toHaveBeenCalledWith('user_id.eq.user-1,user_id.is.null');
      expect(chain.order).toHaveBeenCalledWith('sent_at', { ascending: false });
      expect(chain.limit).toHaveBeenCalledWith(50);
    });

    test('returns an empty array when data is null', async () => {
      from.mockReturnValue(createQueryChain({ data: null, error: null }));
      expect(await NotificationsService.fetchForUser('user-1')).toEqual([]);
    });

    test('throws on error', async () => {
      from.mockReturnValue(createQueryChain({ data: null, error: { message: 'fetch failed' } }));
      await expect(NotificationsService.fetchForUser('user-1')).rejects.toThrow('fetch failed');
    });
  });

  test('markRead updates is_read for the given notification id', async () => {
    const chain = createQueryChain({ data: null, error: null });
    from.mockReturnValue(chain);

    await NotificationsService.markRead('notif-1');

    expect(chain.update).toHaveBeenCalledWith({ is_read: true });
    expect(chain.eq).toHaveBeenCalledWith('id', 'notif-1');
  });

  test('markAllRead updates only unread notifications for the user', async () => {
    const chain = createQueryChain({ data: null, error: null });
    from.mockReturnValue(chain);

    await NotificationsService.markAllRead('user-1');

    expect(chain.update).toHaveBeenCalledWith({ is_read: true });
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(chain.eq).toHaveBeenCalledWith('is_read', false);
  });

  test('registerToken upserts on the (user_id, token) composite key', async () => {
    const chain = createQueryChain({ data: null, error: null });
    from.mockReturnValue(chain);

    await NotificationsService.registerToken('user-1', 'ExponentPushToken[abc]', 'ios');

    expect(from).toHaveBeenCalledWith('device_tokens');
    expect(chain.upsert).toHaveBeenCalledWith(
      { user_id: 'user-1', token: 'ExponentPushToken[abc]', platform: 'ios' },
      { onConflict: 'user_id,token' },
    );
  });
});
