/**
 * Collections API
 */
import client from './client'

export interface Collection {
  id: string
  name: string
  description: string
  icon: string
  colour: string
  is_smart: boolean
  smart_filter: Record<string, any>
  sort_order: number
  card_count: number
  created_at: string
  updated_at: string
}

export const collectionsApi = {
  list: async (): Promise<Collection[]> => {
    const response = await client.get('/api/collections/')
    // Handle both paginated {count, results} and plain array responses
    const data = response.data
    return Array.isArray(data) ? data : (data.results ?? [])
  },

  get: async (id: string): Promise<Collection> => {
    const response = await client.get(`/api/collections/${id}/`)
    return response.data
  },

  create: async (data: Partial<Collection>): Promise<Collection> => {
    const response = await client.post('/api/collections/', data)
    return response.data
  },

  update: async (id: string, data: Partial<Collection>): Promise<Collection> => {
    const response = await client.patch(`/api/collections/${id}/`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/api/collections/${id}/`)
  },

  reorder: async (items: { id: string; sort_order: number }[]): Promise<void> => {
    await client.post('/api/collections/reorder/', items)
  },
}
