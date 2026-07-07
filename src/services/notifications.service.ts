/**
 * src/services/notifications.service.ts
 */

import { supabase } from '@lib/supabase';
import type { INotification } from '@types';

export const NotificationsService = {
  /**
   * Fetch all notifications for a user — their own personal ones
   * plus broadcast notifications (user_id IS NULL).
   */
  async fetchForUser(userId: string): Promise<INotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('sent_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return (data ?? []) as INotification[];
  },

  async markRead(notificationId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  },

  async markAllRead(userId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  },

  async registerToken(userId: string, token: string, platform: string): Promise<void> {
    await supabase
      .from('device_tokens')
      .upsert({ user_id: userId, token, platform }, { onConflict: 'user_id,token' });
  },
} as const;
