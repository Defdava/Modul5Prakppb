// src/hooks/useRecipes.js
import { useInfiniteQuery, useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import recipeService from '../services/recipeService';

/**
 * useRecipes - infinite query for list with caching + lazy load
 * Backend expectation: recipeService.getRecipes(params) returns { data: Recipe[], meta: { next_page: number | null } }
 */
export function useRecipes({ baseParams = {} } = {}) {
  return useInfiniteQuery(
    ['recipes', baseParams],
    ({ pageParam = 1 }) => recipeService.getRecipes({ ...baseParams, page: pageParam }),
    {
      getNextPageParam: (lastPage) => {
        // adapt to your API response shape:
        // try lastPage.meta.next_page or lastPage.nextPage
        if (!lastPage) return false;
        if (lastPage.meta && typeof lastPage.meta.next_page !== 'undefined') return lastPage.meta.next_page;
        if (typeof lastPage.nextPage !== 'undefined') return lastPage.nextPage;
        return false;
      },
      staleTime: 1000 * 60 * 2,
      cacheTime: 1000 * 60 * 10,
    }
  );
}

/** useRecipe - fetch single recipe (cached) */
export function useRecipe(recipeId) {
  return useQuery(
    ['recipe', recipeId],
    () => recipeService.getRecipe(recipeId),
    {
      enabled: !!recipeId,
      staleTime: 1000 * 60 * 5,
    }
  );
}

/** useUpdateRecipe - optimistic update */
export function useUpdateRecipe() {
  const qc = useQueryClient();
  return useMutation(
    ({ id, payload }) => recipeService.updateRecipe(id, payload),
    {
      onMutate: async ({ id, payload }) => {
        await qc.cancelQueries(['recipe', id]);
        await qc.cancelQueries(['recipes']);
        const previous = qc.getQueryData(['recipe', id]);
        qc.setQueryData(['recipe', id], (old) => ({ ...(old || {}), ...payload }));
        // also patch cached recipe lists
        qc.setQueryData(['recipes'], (old) => {
          if (!old) return old;
          const pages = old.pages.map((page) => ({
            ...page,
            data: page.data.map(r => (r.id === id ? { ...r, ...payload } : r))
          }));
          return { ...old, pages };
        });
        return { previous };
      },
      onError: (err, variables, context) => {
        if (context?.previous) {
          qc.setQueryData(['recipe', variables.id], context.previous);
        }
      },
      onSettled: (data, err, variables) => {
        qc.invalidateQueries(['recipes']);
        qc.invalidateQueries(['recipe', variables.id]);
      },
    }
  );
}
