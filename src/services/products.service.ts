/**
 * src/services/products.service.ts
 *
 * Data access layer for products. Pure async functions only — no React,
 * no hooks, no stores. All callers go through hooks/useProducts.ts.
 */

import { supabase } from '@lib/supabase';
import type { IProduct } from '@types';

export const ProductsService = {
  /**
   * Fetch all active products ordered by sort_order.
   * Throws on network / RLS error so callers can handle via TanStack Query.
   */
  async fetchAll(): Promise<IProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as IProduct[];
  },

  /**
   * Fetch a single product by id.
   */
  async fetchById(id: string): Promise<IProduct> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data as IProduct;
  },

  /**
   * Fetch products filtered by category.
   */
  async fetchByCategory(cat: string): Promise<IProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .eq('cat', cat)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as IProduct[];
  },
} as const;
