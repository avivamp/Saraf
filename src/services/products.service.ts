/**
 * src/services/products.service.ts
 *
 * Reads from products_with_images view so every product row
 * already includes its full ordered images array — no N+1.
 */

import { supabase } from '@lib/supabase';
import type { IProduct } from '@types';

const VIEW = 'products_with_images';

export const ProductsService = {
  async fetchAll(): Promise<IProduct[]> {
    const { data, error } = await supabase
      .from(VIEW)
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(normalise) as IProduct[];
  },

  async fetchById(id: string): Promise<IProduct> {
    const { data, error } = await supabase
      .from(VIEW)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return normalise(data) as IProduct;
  },

  async fetchByCategory(cat: string): Promise<IProduct[]> {
    const { data, error } = await supabase
      .from(VIEW)
      .select('*')
      .eq('active', true)
      .eq('cat', cat)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(normalise) as IProduct[];
  },
} as const;

/** Ensure images is always an array even if the view returned null. */
function normalise(row: any): IProduct {
  return {
    ...row,
    images: Array.isArray(row.images) ? row.images : [],
  };
}
