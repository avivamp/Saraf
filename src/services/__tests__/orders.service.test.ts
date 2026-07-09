import { createQueryChain } from '../../test-utils/supabaseMock';

jest.mock('@lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '@lib/supabase';
import { OrdersService } from '@services/orders.service';
import type { CartLine, PlaceOrderPayload } from '@types';

const from = supabase.from as jest.Mock;

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const cart: CartLine[] = [
  { id: 'p1', productId: 'p1', name: 'Watch', icon: '⌚', price: 500, qty: 1, variantLabel: 'Gold' },
  { id: 'p2', productId: 'p2', name: 'Bag', icon: null, price: 300, qty: 2, variantLabel: null },
];

function mockChains(orderResult: any, itemsResult: any) {
  const ordersChain = createQueryChain(orderResult);
  const itemsChain = createQueryChain(itemsResult);
  from.mockImplementation((table: string) => (table === 'orders' ? ordersChain : itemsChain));
  return { ordersChain, itemsChain };
}

describe('OrdersService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('fetchByUser', () => {
    test('queries orders_with_items filtered by user, newest first', async () => {
      const chain = createQueryChain({ data: [], error: null });
      from.mockReturnValue(chain);

      await OrdersService.fetchByUser('user-1');

      expect(from).toHaveBeenCalledWith('orders_with_items');
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    test('throws on error', async () => {
      from.mockReturnValue(createQueryChain({ data: null, error: { message: 'fetch failed' } }));
      await expect(OrdersService.fetchByUser('user-1')).rejects.toThrow('fetch failed');
    });
  });

  describe('placeOrder', () => {
    const basePayload: PlaceOrderPayload = {
      userId: 'user-1',
      guestEmail: null,
      cart,
      total: 1100,
      cardSaved: true,
    };

    test('generates a valid v4 UUID for the order id and returns it', async () => {
      const { ordersChain } = mockChains({ data: null, error: null }, { data: null, error: null });

      const orderId = await OrdersService.placeOrder(basePayload);

      expect(orderId).toMatch(UUID_V4);
      expect(ordersChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ id: orderId }),
      );
    });

    test('signed-in user: user_id set, guest_email null, guest_mode false', async () => {
      const { ordersChain } = mockChains({ data: null, error: null }, { data: null, error: null });

      await OrdersService.placeOrder(basePayload);

      expect(ordersChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          guest_email: null,
          guest_mode: false,
          total: 1100,
          card_saved: true,
          status: 'confirmed',
        }),
      );
    });

    test('guest checkout: user_id null, guest_email lowercased and trimmed, guest_mode true', async () => {
      const { ordersChain } = mockChains({ data: null, error: null }, { data: null, error: null });

      await OrdersService.placeOrder({
        ...basePayload,
        userId: null,
        guestEmail: '  Guest@Example.COM  ',
      });

      expect(ordersChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: null,
          guest_email: 'guest@example.com',
          guest_mode: true,
        }),
      );
    });

    test('guest checkout without an email leaves guest_email null', async () => {
      const { ordersChain } = mockChains({ data: null, error: null }, { data: null, error: null });

      await OrdersService.placeOrder({ ...basePayload, userId: null, guestEmail: null });

      expect(ordersChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ guest_email: null, guest_mode: true }),
      );
    });

    test('maps cart lines to order_items rows, defaulting missing icon/variant to null', async () => {
      const { itemsChain } = mockChains({ data: null, error: null }, { data: null, error: null });

      const orderId = await OrdersService.placeOrder(basePayload);

      expect(itemsChain.insert).toHaveBeenCalledWith([
        {
          order_id: orderId,
          product_id: 'p1',
          product_name: 'Watch',
          product_icon: '⌚',
          variant_label: 'Gold',
          unit_price: 500,
          quantity: 1,
        },
        {
          order_id: orderId,
          product_id: 'p2',
          product_name: 'Bag',
          product_icon: null,
          variant_label: null,
          unit_price: 300,
          quantity: 2,
        },
      ]);
    });

    test('throws and never inserts order_items when the order insert fails', async () => {
      const { itemsChain } = mockChains({ data: null, error: { message: 'order insert failed' } }, { data: null, error: null });

      await expect(OrdersService.placeOrder(basePayload)).rejects.toThrow('order insert failed');
      expect(itemsChain.insert).not.toHaveBeenCalled();
    });

    test('throws when the order_items insert fails', async () => {
      mockChains({ data: null, error: null }, { data: null, error: { message: 'items insert failed' } });

      await expect(OrdersService.placeOrder(basePayload)).rejects.toThrow('items insert failed');
    });
  });
});
