import { createQueryChain } from '../../test-utils/supabaseMock';

jest.mock('@lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '@lib/supabase';
import { CartService } from '@services/cart.service';
import type { CartLine } from '@types';

const from = supabase.from as jest.Mock;

const sampleLines: CartLine[] = [
  { id: 'p1', productId: 'p1', name: 'Item', icon: null, price: 10, qty: 2, variantLabel: null },
];

describe('CartService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('load', () => {
    test('returns the saved items for the user', async () => {
      const chain = createQueryChain({ data: { items: sampleLines }, error: null });
      from.mockReturnValue(chain);

      const result = await CartService.load('user-1');

      expect(from).toHaveBeenCalledWith('saved_carts');
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(chain.maybeSingle).toHaveBeenCalled();
      expect(result).toEqual(sampleLines);
    });

    test('returns an empty array when no saved cart row exists', async () => {
      from.mockReturnValue(createQueryChain({ data: null, error: null }));
      expect(await CartService.load('user-1')).toEqual([]);
    });

    test('throws on error', async () => {
      from.mockReturnValue(createQueryChain({ data: null, error: { message: 'load failed' } }));
      await expect(CartService.load('user-1')).rejects.toThrow('load failed');
    });
  });

  describe('save', () => {
    test('upserts items keyed by user_id', async () => {
      const chain = createQueryChain({ data: null, error: null });
      from.mockReturnValue(chain);

      await CartService.save('user-1', sampleLines);

      expect(chain.upsert).toHaveBeenCalledWith(
        { user_id: 'user-1', items: sampleLines },
        { onConflict: 'user_id' },
      );
    });

    test('throws on error', async () => {
      from.mockReturnValue(createQueryChain({ data: null, error: { message: 'save failed' } }));
      await expect(CartService.save('user-1', sampleLines)).rejects.toThrow('save failed');
    });
  });

  describe('clear', () => {
    test('saves an empty items array', async () => {
      const chain = createQueryChain({ data: null, error: null });
      from.mockReturnValue(chain);

      await CartService.clear('user-1');

      expect(chain.upsert).toHaveBeenCalledWith(
        { user_id: 'user-1', items: [] },
        { onConflict: 'user_id' },
      );
    });
  });
});
