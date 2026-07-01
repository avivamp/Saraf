/**
 * src/services/cart.service.ts
 *
 * Remote cart persistence. The in-memory cart lives in cart.store.ts;
 * this service syncs it to Supabase for signed-in users.
 */

import { supabase } from '@lib/supabase';
import type { CartLine } from '@types';

export const CartService = {
  async load(userId: string): Promise<CartLine[]> {
    const { data, error } = await supabase
      .from('saved_carts')
      .select('items')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data?.items ?? []) as CartLine[];
  },

  async save(userId: string, items: CartLine[]): Promise<void> {
    const { error } = await supabase
      .from('saved_carts')
      .upsert({ user_id: userId, items }, { onConflict: 'user_id' });

    if (error) throw new Error(error.message);
  },

  async clear(userId: string): Promise<void> {
    await CartService.save(userId, []);
  },
} as const;
