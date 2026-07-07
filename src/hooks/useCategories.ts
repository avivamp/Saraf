/**
 * src/hooks/useCategories.ts
 */

import { useQuery } from '@tanstack/react-query';
import { CategoriesService } from '@services/categories.service';

export const CATEGORIES_QUERY_KEY = ['categories'] as const;

export function useCategories() {
  const query = useQuery({
    queryKey:  CATEGORIES_QUERY_KEY,
    queryFn:   CategoriesService.fetchAll,
    staleTime: 1000 * 60 * 5, // 5 min — category changes are infrequent
  });

  const all      = query.data ?? [];
  const active   = all.filter((c) => c.active);

  return {
    categories:       all,
    activeCategories: active,   // only visible ones, in sort_order
    isLoading:        query.isLoading,
    refetch:          query.refetch,
  };
}
