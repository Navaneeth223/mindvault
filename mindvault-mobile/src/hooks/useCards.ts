/**
 * useCards — TanStack Query hooks for cards
 */
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'

export function useCards(params: Record<string, any> = {}) {
  return useInfiniteQuery({
    queryKey: ['cards', params],
    queryFn: ({ pageParam = 1 }) =>
      client.get('/api/cards/', {
        params: { ...params, page: pageParam, page_size: 20 },
      }).then(r => r.data),
    getNextPageParam: (last, pages) => last.next ? pages.length + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useToggleFavourite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardId: string) => client.post(`/api/cards/${cardId}/favourite/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cards'] }),
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardId: string) => client.delete(`/api/cards/${cardId}/destroy/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cards'] }),
  })
}
