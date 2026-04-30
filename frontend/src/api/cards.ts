/**
 * Cards API
 */
import client from './client'

export interface Card {
  id: string
  type: 'link' | 'youtube' | 'github' | 'note' | 'image' | 'pdf' | 'voice' | 'code' | 'reel' | 'chat' | 'file'
  card_type_display: string
  title: string
  description: string
  body: string
  url: string
  domain: string | null
  file_url: string | null
  thumbnail_url: string | null
  favicon_url: string
  og_image_url: string
  metadata: Record<string, any>
  transcript: string
  collection: string | null
  collection_detail: {
    id: string
    name: string
    icon: string
    colour: string
  } | null
  tags: string[]
  is_favourite: boolean
  is_archived: boolean
  is_pinned: boolean
  reminder_at: string | null
  reminder_done: boolean
  created_at: string
  updated_at: string
  last_viewed_at: string | null
  time_since_created: string
}

export interface CardListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Card[]
}

export interface CreateCardData {
  type: string
  title: string
  description?: string
  body?: string
  url?: string
  file?: File
  collection?: string
  tags?: string[]
  is_favourite?: boolean
  reminder_at?: string
}

export const cardsApi = {
  list: async (params?: Record<string, any>): Promise<CardListResponse> => {
    // Normalise boolean params — django-filter expects 'true'/'false' strings
    const normalised: Record<string, any> = {}
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null) continue
        normalised[k] = typeof v === 'boolean' ? String(v) : v
      }
    }
    const response = await client.get('/api/cards/', { params: normalised })
    return response.data
  },

  get: async (id: string): Promise<Card> => {
    const response = await client.get(`/api/cards/${id}/`)
    return response.data
  },

  create: async (data: CreateCardData): Promise<Card> => {
    const response = await client.post('/api/cards/', data)
    return response.data
  },

  update: async (id: string, data: Partial<Card>): Promise<Card> => {
    const response = await client.patch(`/api/cards/${id}/`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/api/cards/${id}/`)
  },

  permanentDelete: async (id: string): Promise<void> => {
    await client.delete(`/api/cards/${id}/destroy/`)
  },

  toggleFavourite: async (id: string): Promise<{ is_favourite: boolean }> => {
    const response = await client.post(`/api/cards/${id}/favourite/`)
    return response.data
  },

  toggleArchive: async (id: string): Promise<{ is_archived: boolean }> => {
    const response = await client.post(`/api/cards/${id}/archive/`)
    return response.data
  },

  togglePin: async (id: string): Promise<{ is_pinned: boolean }> => {
    const response = await client.post(`/api/cards/${id}/pin/`)
    return response.data
  },

  recordView: async (id: string): Promise<void> => {
    await client.post(`/api/cards/${id}/view/`)
  },

  getRandom: async (): Promise<Card> => {
    const response = await client.get('/api/cards/random/')
    return response.data
  },

  bulkDelete: async (ids: string[], permanent = false): Promise<{ count: number }> => {
    const response = await client.post('/api/cards/bulk_delete/', { ids, permanent })
    return response.data
  },
}
