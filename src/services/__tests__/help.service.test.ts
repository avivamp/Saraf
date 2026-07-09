import { createQueryChain } from '../../test-utils/supabaseMock';

jest.mock('@lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '@lib/supabase';
import { HelpService } from '@services/help.service';

const from = supabase.from as jest.Mock;

describe('HelpService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('fetchArticles', () => {
    test('filters to active articles ordered by sort_order', async () => {
      const chain = createQueryChain({ data: [], error: null });
      from.mockReturnValue(chain);

      await HelpService.fetchArticles();

      expect(from).toHaveBeenCalledWith('help_articles');
      expect(chain.eq).toHaveBeenCalledWith('active', true);
      expect(chain.order).toHaveBeenCalledWith('sort_order', { ascending: true });
    });

    test('throws on error', async () => {
      from.mockReturnValue(createQueryChain({ data: null, error: { message: 'fail' } }));
      await expect(HelpService.fetchArticles()).rejects.toThrow('fail');
    });
  });

  describe('fetchPolicy', () => {
    test('filters by id and uses single()', async () => {
      const chain = createQueryChain({ data: { id: 'return' }, error: null });
      from.mockReturnValue(chain);

      const policy = await HelpService.fetchPolicy('return');

      expect(chain.eq).toHaveBeenCalledWith('id', 'return');
      expect(chain.single).toHaveBeenCalled();
      expect(policy.id).toBe('return');
    });

    test('throws on error', async () => {
      from.mockReturnValue(createQueryChain({ data: null, error: { message: 'not found' } }));
      await expect(HelpService.fetchPolicy('missing')).rejects.toThrow('not found');
    });
  });

  describe('fetchAllPolicies', () => {
    test('selects only summary columns', async () => {
      const chain = createQueryChain({ data: [], error: null });
      from.mockReturnValue(chain);

      await HelpService.fetchAllPolicies();

      expect(chain.select).toHaveBeenCalledWith('id, title_en, title_ar, updated_at');
    });

    test('returns an empty array when data is null', async () => {
      from.mockReturnValue(createQueryChain({ data: null, error: null }));
      expect(await HelpService.fetchAllPolicies()).toEqual([]);
    });

    test('throws on error', async () => {
      from.mockReturnValue(createQueryChain({ data: null, error: { message: 'fail' } }));
      await expect(HelpService.fetchAllPolicies()).rejects.toThrow('fail');
    });
  });
});
