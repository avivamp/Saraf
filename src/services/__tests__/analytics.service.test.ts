jest.mock('@lib/supabase', () => ({
  supabase: { rpc: jest.fn() },
}));

import { supabase } from '@lib/supabase';
import { AnalyticsService } from '@services/analytics.service';

const rpc = supabase.rpc as jest.Mock;

describe('AnalyticsService.incrementVisitors', () => {
  beforeEach(() => jest.clearAllMocks());

  test('calls the increment_visitors RPC and returns the new count', async () => {
    rpc.mockResolvedValue({ data: 7, error: null });
    const result = await AnalyticsService.incrementVisitors();
    expect(rpc).toHaveBeenCalledWith('increment_visitors');
    expect(result).toBe(7);
  });

  test('throws the Supabase error message on failure', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'rpc failed' } });
    await expect(AnalyticsService.incrementVisitors()).rejects.toThrow('rpc failed');
  });
});
