/**
 * Capture Store
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages quick capture modal state and form data
 */
import { create } from 'zustand'

type CaptureType = 'link' | 'youtube' | 'github' | 'note' | 'voice' | 'code' | 'image' | 'pdf' | 'file'

interface CaptureState {
  selectedType: CaptureType | null
  url: string
  scrapedData: any | null
  isLoading: boolean
  
  // Actions
  setType: (type: CaptureType) => void
  setUrl: (url: string) => void
  setScrapedData: (data: any) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useCaptureStore = create<CaptureState>((set) => ({
  selectedType: null,
  url: '',
  scrapedData: null,
  isLoading: false,

  setType: (type) => set({ selectedType: type }),
  setUrl: (url) => set({ url }),
  setScrapedData: (data) => set({ scrapedData: data }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  reset: () => set({
    selectedType: null,
    url: '',
    scrapedData: null,
    isLoading: false,
  }),
}))
