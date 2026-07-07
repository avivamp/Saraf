/**
 * src/hooks/useProducts.ts
 *
 * Products are filtered by:
 *  1. The active category tab selection
 *  2. Whether the product's category is currently active in the DB
 *     (if an admin hides a category, those products disappear automatically)
 */

import { useQuery } from '@tanstack/react-query';
import { ProductsService } from '@services/products.service';
import { useUIStore } from '@store/ui.store';
import { CATEGORIES_QUERY_KEY } from '@hooks/useCategories';
import { CategoriesService } from '@services/categories.service';

export const PRODUCTS_QUERY_KEY = ['products'] as const;

export function useProducts() {
  const activeCategory = useUIStore((s) => s.activeCategory);

  const productsQuery = useQuery({
    queryKey:  PRODUCTS_QUERY_KEY,
    queryFn:   ProductsService.fetchAll,
    staleTime: 1000 * 60 * 5,
    gcTime:    1000 * 60 * 30,
  });

  const categoriesQuery = useQuery({
    queryKey:  CATEGORIES_QUERY_KEY,
    queryFn:   CategoriesService.fetchAll,
    staleTime: 1000 * 60 * 5,
  });

  // Set of category names that are currently active
  const activeCatNames = new Set(
    (categoriesQuery.data ?? [])
      .filter((c) => c.active)
      .map((c) => c.name)
  );

  const visibleProducts = (productsQuery.data ?? []).filter(
    (p) => activeCatNames.size === 0 || activeCatNames.has(p.cat)
  );

  const filtered =
    activeCategory === 'All'
      ? visibleProducts
      : visibleProducts.filter((p) => p.cat === activeCategory);

  return {
    products:         visibleProducts,
    filteredProducts: filtered,
    isLoading:        productsQuery.isLoading || categoriesQuery.isLoading,
    isError:          productsQuery.isError,
    error:            productsQuery.error?.message ?? null,
    refetch:          productsQuery.refetch,
  };
}
