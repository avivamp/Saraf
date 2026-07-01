/**
 * src/services/analytics.service.ts
 */

import { supabase } from '@lib/supabase';

export const AnalyticsService = {
  /**
   * Atomically increments the visitor counter and returns the new value.
   * Uses a Supabase RPC (security definer function) so no RLS bypass is
   * needed on the client.
   */
  async incrementVisitors(): Promise<number> {
    const { data, error } = await supabase.rpc('increment_visitors');
    if (error) throw new Error(error.message);
    return data as number;
  },
} as const;
