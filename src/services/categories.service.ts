/**
 * src/services/categories.service.ts
 */

import { supabase } from '@lib/supabase';
import type { ICategory } from '@types';

export const CategoriesService = {
  /** Fetch all categories ordered by sort_order (active and inactive). */
  async fetchAll(): Promise<ICategory[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as ICategory[];
  },
} as const;
