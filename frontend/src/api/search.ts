/**
 * Search API
 */
import client from './client'
import { CardListResponse } from './cards'

export interface SearchSuggestion {
  type: 'tag' | 'collection' | 'card'
  value: string
  label: string
}

export const searchApi = {
  search: async (params: Record<string, any>): Promise<CardListResponse> => {
    const response = await client.get('/api/search/', { params })
    return response.data
  },

  getSuggestions: async (query: string): Promise<SearchSuggestion[]> => {
    const response = await client.get('/api/search/suggestions/', { params: { q: query } })
    return response.data
  },
}
