/**
 * Metadata Scraping API
 */
import client from './client'

export interface ScrapedMetadata {
  url: string
  type: string
  title: string
  description: string
  og_image: string
  favicon: string
  domain: string
}

export const metaApi = {
  scrapeUrl: async (url: string): Promise<ScrapedMetadata> => {
    const response = await client.post('/api/meta/scrape/', { url })
    return response.data
  },

  getYouTubeMetadata: async (url: string): Promise<any> => {
    const response = await client.post('/api/meta/youtube/', { url })
    return response.data
  },

  getGitHubMetadata: async (url: string): Promise<any> => {
    const response = await client.post('/api/meta/github/', { url })
    return response.data
  },
}
