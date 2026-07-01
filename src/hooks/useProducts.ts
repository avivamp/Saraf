/**
 * src/hooks/useProducts.ts
 */

import { useQuery } from '@tanstack/react-query';
import { ProductsService } from '@services/products.service';
import { useUIStore } from '@store/ui.store';

export const PRODUCTS_QUERY_KEY = ['products'] as const;

export function useProducts() {
  const activeCategory = useUIStore((s) => s.activeCategory);

  const query = useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn:  ProductsService.fetchAll,
    staleTime: 1000 * 60 * 5, // 5 min — product catalogue changes infrequently
    gcTime:    1000 * 60 * 30,
  });

  const filtered =
    activeCategory === 'All'
      ? (query.data ?? [])
      : (query.data ?? []).filter((p) => p.cat === activeCategory);

  return {
    products:        query.data ?? [],
    filteredProducts: filtered,
    isLoading:       query.isLoading,
    isError:         query.isError,
    error:           query.error?.message ?? null,
    refetch:         query.refetch,
  };
}
