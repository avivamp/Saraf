/**
 * src/services/orders.service.ts
 */

import { supabase } from '@lib/supabase';
import type { IOrder, PlaceOrderPayload } from '@types';

/** RFC 4122 v4 UUID — works after react-native-get-random-values polyfill. */
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export const OrdersService = {
  async fetchByUser(userId: string): Promise<IOrder[]> {
    const { data, error } = await supabase
      .from('orders_with_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as IOrder[];
  },

  async placeOrder({ userId, guestEmail, cart, total, cardSaved }: PlaceOrderPayload): Promise<string> {
    // Generate the ID client-side so we never need to SELECT after INSERT.
    // Guests pass the RLS insert check (guest_mode=true, user_id=null) but
    // fail the SELECT check (auth.uid()=null doesn't equal null in Postgres),
    // so .select('id').single() would throw for unauthenticated users.
    const orderId = uuid();

    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id:          orderId,
        user_id:     userId ?? null,
        guest_email: !userId && guestEmail ? guestEmail.toLowerCase().trim() : null,
        total,
        card_saved:  cardSaved,
        guest_mode:  !userId,
        status:      'confirmed',
      });

    if (orderError) throw new Error(orderError.message);

    const itemRows = cart.map((line) => ({
      order_id:      orderId,
      product_id:    line.productId,
      product_name:  line.name,
      product_icon:  line.icon ?? null,
      variant_label: line.variantLabel ?? null,
      unit_price:    line.price,
      quantity:      line.qty,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
    if (itemsError) throw new Error(itemsError.message);

    return orderId;
  },
} as const;
