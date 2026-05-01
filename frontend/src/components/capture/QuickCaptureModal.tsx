/**
 * Quick Capture Modal
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete capture modal with all form types
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useUIStore } from '@/store/uiStore'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { cardsApi } from '@/api/cards'
import CaptureTypeSelector, { CaptureType } from './CaptureTypeSelector'
import URLCapture from './URLCapture'
import NoteCapture from './NoteCapture'
import CodeCapture from './CodeCapture'
import FileCapture from './FileCapture'
import ChatCapture from './ChatCapture'
import VoiceCapture from './VoiceCapture'
import TagInput from '../ui/TagInput'
import CollectionSelect from '../ui/CollectionSelect'
import ReminderPicker from '../ui/ReminderPicker'

// URL detection patterns
const URL_PATTERNS = {
  youtube: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  github: /github\.com\/([^/]+)\/([^/]+)/,
  image: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
  pdf: /\.pdf$/i,
}

function detectUrlType(url: string): CaptureType {
  try {
    const urlObj = new URL(url)
    if (URL_PATTERNS.youtube.test(url)) return 'url' // Will be detected as youtube by backend
    if (URL_PATTERNS.github.test(url)) return 'url' // Will be detected as github by backend
    if (URL_PATTERNS.image.test(urlObj.pathname)) return 'url' // Will be detected as image by backend
    if (URL_PATTERNS.pdf.test(urlObj.pathname)) return 'url' // Will be detected as pdf by backend
    return 'url'
  } catch {
    return 'url'
  }
}

export default function QuickCaptureModal() {
  const { captureOpen, closeCapture } = useUIStore()
  const queryClient = useQueryClient()
  const { isMobile } = useBreakpoint()

  const [captureType, setCaptureType] = useState<CaptureType>('url')
  const [tags, setTags] = useState<string[]>([])
  const [collection, setCollection] = useState<string | null>(null)
  const [reminder, setReminder] = useState<string | null>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  // iOS keyboard height tracking
  useEffect(() => {
    const handler = () => {
      if (window.visualViewport) {
        const kbHeight = Math.max(0, window.innerHeight - window.visualViewport.height)
        setKeyboardHeight(kbHeight)
      }
    }
    window.visualViewport?.addEventListener('resize', handler, { passive: true })
    return () => window.visualViewport?.removeEventListener('resize', handler)
  }, [])

  // Reset state when modal closes
  useEffect(() => {
    if (!captureOpen) {
      setTimeout(() => {
        setCaptureType('url')
        setTags([])
        setCollection(null)
        setReminder(null)
      }, 300)
    }
  }, [captureOpen])

  // Auto-detect URL from clipboard
  useEffect(() => {
    if (captureOpen) {
      navigator.clipboard.readText().then((text) => {
        if (text && text.startsWith('http')) {
          const detectedType = detectUrlType(text)
          setCaptureType(detectedType)
        }
      }).catch(() => {
        // Clipboard access denied, ignore
      })
    }
  }, [captureOpen])

  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: async (data: any) => {
      // Handle file upload separately
      if (data.file) {
        const formData = new FormData()
        formData.append('file', data.file)
        formData.append('title', data.title)
        if (data.collection) formData.append('collection', data.collection)
        if (data.tags) formData.append('tags', JSON.stringify(data.tags))
        if (data.reminder_at) formData.append('reminder_at', data.reminder_at)

        const response = await fetch('/api/upload/', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: formData,
        })

        if (!response.ok) throw new Error('Upload failed')
        return response.json()
      }

      // Handle voice upload
      if (data.audioBlob) {
        const formData = new FormData()
        formData.append('file', data.audioBlob, 'voice-note.webm')
        formData.append('type', 'voice')
        formData.append('title', data.title)
        if (data.transcript) formData.append('transcript', data.transcript)
        if (data.language) formData.append('language', data.language)
        if (data.collection) formData.append('collection', data.collection)
        if (data.tags) formData.append('tags', JSON.stringify(data.tags))
        if (data.reminder_at) formData.append('reminder_at', data.reminder_at)

        const response = await fetch('/api/upload/', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: formData,
        })

        if (!response.ok) throw new Error('Upload failed')
        return response.json()
      }

      // Regular card creation
      return cardsApi.create(data)
    },
    onSuccess: () => {
      // Close first, then invalidate — prevents freeze from simultaneous
      // AnimatePresence exit + React Query re-render
      closeCapture()
      toast.success('Card saved!')
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['cards'] })
      }, 350) // after modal exit animation completes
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save card')
    },
  })

  // Handle URL capture
  const handleUrlSave = (data: { url: string; metadata: any }) => {
    createCardMutation.mutate({
      type: data.metadata.type || 'link',
      url: data.url,
      title: data.metadata.title,
      description: data.metadata.description,
      collection,
      tags,
      reminder_at: reminder,
    })
  }

  // Handle note capture
  const handleNoteSave = (data: { title: string; body: string }) => {
    createCardMutation.mutate({
      type: 'note',
      title: data.title,
      body: data.body,
      collection,
      tags,
      reminder_at: reminder,
    })
  }

  // Handle code capture
  const handleCodeSave = (data: { title: string; body: string; language: string }) => {
    createCardMutation.mutate({
      type: 'code',
      title: data.title,
      body: data.body,
      metadata: { language: data.language },
      collection,
      tags,
      reminder_at: reminder,
    })
  }

  // Handle file capture
  const handleFileSave = (data: { file: File; title: string }) => {
    createCardMutation.mutate({
      file: data.file,
      title: data.title,
      collection,
      tags,
      reminder_at: reminder,
    })
  }

  // Handle chat capture
  const handleChatSave = (data: { title: string; body: string; source: string }) => {
    createCardMutation.mutate({
      type: 'chat',
      title: data.title,
      body: data.body,
      metadata: { source: data.source },
      collection,
      tags,
      reminder_at: reminder,
    })
  }

  // Handle voice capture
  const handleVoiceSave = (data: { audioBlob: Blob; transcript: string; title: string; language: string }) => {
    createCardMutation.mutate({
      audioBlob: data.audioBlob,
      title: data.title,
      transcript: data.transcript,
      language: data.language,
      collection,
      tags,
      reminder_at: reminder,
    })
  }

  return (
    <AnimatePresence>
      {captureOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCapture}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-2xl max-h-[90vh] bg-dark-surface border border-dark-border rounded-3xl shadow-soft-lg pointer-events-auto overflow-hidden flex flex-col"
              style={isMobile && keyboardHeight > 0 ? { marginBottom: keyboardHeight } : undefined}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-dark-border flex-shrink-0">
                <h2 className="text-xl font-serif font-semibold">Quick Capture</h2>
                <button
                  onClick={closeCapture}
                  className="p-2 rounded-xl hover:bg-dark-hover transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Type Selector */}
                  <CaptureTypeSelector selected={captureType} onChange={setCaptureType} />

                  {/* Form Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={captureType}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {captureType === 'url' && (
                        <URLCapture onSave={handleUrlSave} onCancel={closeCapture} />
                      )}
                      {captureType === 'note' && (
                        <NoteCapture onSave={handleNoteSave} onCancel={closeCapture} />
                      )}
                      {captureType === 'code' && (
                        <CodeCapture onSave={handleCodeSave} onCancel={closeCapture} />
                      )}
                      {captureType === 'file' && (
                        <FileCapture onSave={handleFileSave} onCancel={closeCapture} />
                      )}
                      {captureType === 'chat' && (
                        <ChatCapture onSave={handleChatSave} onCancel={closeCapture} />
                      )}
                      {captureType === 'voice' && (
                        <VoiceCapture onSave={handleVoiceSave} onCancel={closeCapture} />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Common Fields */}
                  <div className="pt-6 border-t border-dark-border space-y-4">
                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                        Tags
                      </label>
                      <TagInput value={tags} onChange={setTags} />
                    </div>

                    {/* Collection */}
                    <div>
                      <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                        Collection
                      </label>
                      <CollectionSelect value={collection} onChange={setCollection} />
                    </div>

                    {/* Reminder */}
                    <ReminderPicker value={reminder} onChange={setReminder} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
