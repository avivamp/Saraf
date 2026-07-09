import { createQueryChain } from '../../test-utils/supabaseMock';

jest.mock('@lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '@lib/supabase';
import { ConfigService } from '@services/config.service';

const from = supabase.from as jest.Mock;

const DEFAULTS = {
  app_name:       'Saraf',
  app_tagline_en: 'LUXURY, DELIVERED',
  app_tagline_ar: 'الفخامة، تُوصَل إليك',
  app_logo_url:   '',
  support_email:  'hello@saraf.ae',
  support_phone:  '+971 4 000 0000',
  version:        '1.0.0',
};

describe('ConfigService.fetch', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns hard-coded defaults when Supabase errors', async () => {
    from.mockReturnValue(createQueryChain({ data: null, error: { message: 'down' } }));
    expect(await ConfigService.fetch()).toEqual(DEFAULTS);
  });

  test('returns hard-coded defaults when no rows exist', async () => {
    from.mockReturnValue(createQueryChain({ data: null, error: null }));
    expect(await ConfigService.fetch()).toEqual(DEFAULTS);
  });

  test('overrides only the keys present in the app_config table', async () => {
    from.mockReturnValue(createQueryChain({
      data: [
        { key: 'app_name', value: 'Saraf Prestige' },
        { key: 'support_email', value: 'vip@saraf.ae' },
      ],
      error: null,
    }));

    const config = await ConfigService.fetch();

    expect(config.app_name).toBe('Saraf Prestige');
    expect(config.support_email).toBe('vip@saraf.ae');
    // untouched keys fall back to defaults
    expect(config.app_tagline_en).toBe(DEFAULTS.app_tagline_en);
    expect(config.version).toBe(DEFAULTS.version);
  });

  test('ignores unknown keys in the table', async () => {
    from.mockReturnValue(createQueryChain({
      data: [{ key: 'unknown_flag', value: 'true' }],
      error: null,
    }));
    expect(await ConfigService.fetch()).toEqual(DEFAULTS);
  });
});
