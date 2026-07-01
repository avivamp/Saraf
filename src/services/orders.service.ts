/**
 * src/services/orders.service.ts
 */

import { supabase } from '@lib/supabase';
import type { IOrder, PlaceOrderPayload } from '@types';

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

  async placeOrder({ userId, cart, total, cardSaved }: PlaceOrderPayload): Promise<string> {
    // Insert parent order row
    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id:    userId,
        total,
        card_saved: cardSaved,
        guest_mode: false,
        status:     'confirmed',
      })
      .select('id')
      .single();

    if (orderError || !orderRow) throw new Error(orderError?.message ?? 'Failed to create order.');

    const orderId = orderRow.id as string;

    // Bulk-insert line items
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
