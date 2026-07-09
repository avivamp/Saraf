import { createQueryChain } from '../../test-utils/supabaseMock';

jest.mock('@lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '@lib/supabase';
import { ProductsService } from '@services/products.service';

const from = supabase.from as jest.Mock;

describe('ProductsService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('fetchAll', () => {
    test('queries the products_with_images view filtered to active, ordered by sort_order', async () => {
      const chain = createQueryChain({ data: [{ id: '1', images: null }], error: null });
      from.mockReturnValue(chain);

      await ProductsService.fetchAll();

      expect(from).toHaveBeenCalledWith('products_with_images');
      expect(chain.select).toHaveBeenCalledWith('*');
      expect(chain.eq).toHaveBeenCalledWith('active', true);
      expect(chain.order).toHaveBeenCalledWith('sort_order', { ascending: true });
    });

    test('normalises a null images field to an empty array', async () => {
      from.mockReturnValue(createQueryChain({ data: [{ id: '1', images: null }], error: null }));
      const [product] = await ProductsService.fetchAll();
      expect(product!.images).toEqual([]);
    });

    test('preserves an existing images array', async () => {
      const images = [{ id: 'img1', url: 'x', alt_text: null, sort_order: 0 }];
      from.mockReturnValue(createQueryChain({ data: [{ id: '1', images }], error: null }));
      const [product] = await ProductsService.fetchAll();
      expect(product!.images).toEqual(images);
    });

    test('returns an empty array when data is null', async () => {
      from.mockReturnValue(createQueryChain({ data: null, error: null }));
      const result = await ProductsService.fetchAll();
      expect(result).toEqual([]);
    });

    test('throws the Supabase error message on failure', async () => {
      from.mockReturnValue(createQueryChain({ data: null, error: { message: 'db down' } }));
      await expect(ProductsService.fetchAll()).rejects.toThrow('db down');
    });
  });

  describe('fetchById', () => {
    test('filters by id and uses single()', async () => {
      const chain = createQueryChain({ data: { id: '1', images: [] }, error: null });
      from.mockReturnValue(chain);

      const product = await ProductsService.fetchById('1');

      expect(chain.eq).toHaveBeenCalledWith('id', '1');
      expect(chain.single).toHaveBeenCalled();
      expect(product.id).toBe('1');
    });

    test('throws on error', async () => {
      from.mockReturnValue(createQueryChain({ data: null, error: { message: 'not found' } }));
      await expect(ProductsService.fetchById('missing')).rejects.toThrow('not found');
    });
  });

  describe('fetchByCategory', () => {
    test('filters by active and category, ordered by sort_order', async () => {
      const chain = createQueryChain({ data: [], error: null });
      from.mockReturnValue(chain);

      await ProductsService.fetchByCategory('Cars');

      expect(chain.eq).toHaveBeenCalledWith('active', true);
      expect(chain.eq).toHaveBeenCalledWith('cat', 'Cars');
      expect(chain.order).toHaveBeenCalledWith('sort_order', { ascending: true });
    });

    test('throws on error', async () => {
      from.mockReturnValue(createQueryChain({ data: null, error: { message: 'bad category' } }));
      await expect(ProductsService.fetchByCategory('Cars')).rejects.toThrow('bad category');
    });
  });
});
