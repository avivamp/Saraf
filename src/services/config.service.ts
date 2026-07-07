/**
 * src/services/config.service.ts
 */

import { supabase } from '@lib/supabase';

export interface AppConfig {
  app_name:       string;
  app_tagline_en: string;
  app_tagline_ar: string;
  app_logo_url:   string;
  support_email:  string;
  support_phone:  string;
  version:        string;
}

const DEFAULTS: AppConfig = {
  app_name:       'Saraf',
  app_tagline_en: 'LUXURY, DELIVERED',
  app_tagline_ar: 'الفخامة، تُوصَل إليك',
  app_logo_url:   '',
  support_email:  'hello@saraf.ae',
  support_phone:  '+971 4 000 0000',
  version:        '1.0.0',
};

export const ConfigService = {
  async fetch(): Promise<AppConfig> {
    const { data, error } = await supabase
      .from('app_config')
      .select('key, value');

    if (error || !data) return DEFAULTS;

    const map: Record<string, string> = {};
    data.forEach(({ key, value }) => { map[key] = value; });

    return {
      app_name:       map['app_name']       ?? DEFAULTS.app_name,
      app_tagline_en: map['app_tagline_en'] ?? DEFAULTS.app_tagline_en,
      app_tagline_ar: map['app_tagline_ar'] ?? DEFAULTS.app_tagline_ar,
      app_logo_url:   map['app_logo_url']   ?? DEFAULTS.app_logo_url,
      support_email:  map['support_email']  ?? DEFAULTS.support_email,
      support_phone:  map['support_phone']  ?? DEFAULTS.support_phone,
      version:        map['version']        ?? DEFAULTS.version,
    };
  },
} as const;
