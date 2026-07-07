/**
 * src/services/help.service.ts
 */

import { supabase } from '@lib/supabase';

export interface HelpArticle {
  id:          string;
  question_en: string;
  question_ar: string;
  answer_en:   string;
  answer_ar:   string;
  sort_order:  number;
}

export interface Policy {
  id:         string;
  title_en:   string;
  title_ar:   string;
  content_en: string;
  content_ar: string;
  updated_at: string;
}

export const HelpService = {
  async fetchArticles(): Promise<HelpArticle[]> {
    const { data, error } = await supabase
      .from('help_articles')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as HelpArticle[];
  },

  async fetchPolicy(id: string): Promise<Policy> {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data as Policy;
  },

  async fetchAllPolicies(): Promise<Policy[]> {
    const { data, error } = await supabase
      .from('policies')
      .select('id, title_en, title_ar, updated_at');

    if (error) throw new Error(error.message);
    return (data ?? []) as Policy[];
  },
} as const;
