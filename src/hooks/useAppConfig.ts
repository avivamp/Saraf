/**
 * src/hooks/useAppConfig.ts
 */

import { useQuery } from '@tanstack/react-query';
import { ConfigService, type AppConfig } from '@services/config.service';

const DEFAULTS: AppConfig = {
  app_name:       'Saraf',
  app_tagline_en: 'LUXURY, DELIVERED',
  app_tagline_ar: 'الفخامة، تُوصَل إليك',
  app_logo_url:   '',
  support_email:  'hello@saraf.ae',
  support_phone:  '+971 4 000 0000',
  version:        '1.0.0',
};

export function useAppConfig() {
  const query = useQuery({
    queryKey:  ['app_config'],
    queryFn:   ConfigService.fetch,
    staleTime: 1000 * 60 * 10, // 10 min — changes rarely
    placeholderData: DEFAULTS,
  });

  return query.data ?? DEFAULTS;
}
