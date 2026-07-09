import { createQueryChain } from '../../test-utils/supabaseMock';

jest.mock('@lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '@lib/supabase';
import { CategoriesService } from '@services/categories.service';

const from = supabase.from as jest.Mock;

describe('CategoriesService.fetchAll', () => {
  beforeEach(() => jest.clearAllMocks());

  test('orders by sort_order ascending and returns both active and inactive rows', async () => {
    const rows = [{ id: '1', active: true }, { id: '2', active: false }];
    const chain = createQueryChain({ data: rows, error: null });
    from.mockReturnValue(chain);

    const result = await CategoriesService.fetchAll();

    expect(from).toHaveBeenCalledWith('categories');
    expect(chain.order).toHaveBeenCalledWith('sort_order', { ascending: true });
    expect(result).toEqual(rows);
  });

  test('returns an empty array when data is null', async () => {
    from.mockReturnValue(createQueryChain({ data: null, error: null }));
    expect(await CategoriesService.fetchAll()).toEqual([]);
  });

  test('throws on error', async () => {
    from.mockReturnValue(createQueryChain({ data: null, error: { message: 'boom' } }));
    await expect(CategoriesService.fetchAll()).rejects.toThrow('boom');
  });
});
