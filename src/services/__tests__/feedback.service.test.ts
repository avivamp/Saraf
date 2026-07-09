import { createQueryChain } from '../../test-utils/supabaseMock';

jest.mock('@lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '@lib/supabase';
import { FeedbackService } from '@services/feedback.service';

const from = supabase.from as jest.Mock;

describe('FeedbackService.submit', () => {
  beforeEach(() => jest.clearAllMocks());

  test('inserts a signed-in user feedback row with guest_mode false', async () => {
    const chain = createQueryChain({ data: null, error: null });
    from.mockReturnValue(chain);

    await FeedbackService.submit({ userId: 'user-1', rating: 5, category: 'app', message: '  great  ' });

    expect(from).toHaveBeenCalledWith('feedback');
    expect(chain.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      guest_mode: false,
      rating: 5,
      category: 'app',
      message: 'great',
    });
  });

  test('inserts a guest feedback row with user_id null and guest_mode true', async () => {
    const chain = createQueryChain({ data: null, error: null });
    from.mockReturnValue(chain);

    await FeedbackService.submit({ userId: null, rating: 3, category: 'bug', message: 'meh' });

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: null, guest_mode: true }),
    );
  });

  test('trims whitespace from the message', async () => {
    const chain = createQueryChain({ data: null, error: null });
    from.mockReturnValue(chain);

    await FeedbackService.submit({ userId: null, rating: 1, category: 'x', message: '   padded text   ' });

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'padded text' }),
    );
  });

  test('throws the Supabase error message on failure', async () => {
    from.mockReturnValue(createQueryChain({ data: null, error: { message: 'insert failed' } }));
    await expect(
      FeedbackService.submit({ userId: null, rating: 1, category: 'x', message: 'y' }),
    ).rejects.toThrow('insert failed');
  });
});
