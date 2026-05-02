/**
 * ARIA Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-featured AI agent chat interface with:
 * - Conversation sidebar (desktop)
 * - Message bubbles with tool call accordions
 * - Cards cited section
 * - Voice input
 * - Memory panel
 * - Settings panel
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Send, Mic, MicOff, Settings2, Brain, Sparkles, ChevronLeft,
} from 'lucide-react'
import { agentApi } from '@/api/agent'
import { useAgentStore } from '@/store/agentStore'
import { useSpeechRecognition } from '@/utils/speechRecognition'
import MessageBubble from '@/components/agent/MessageBubble'
import ConversationSidebar from '@/components/agent/ConversationSidebar'
import MemoryPanel from '@/components/agent/MemoryPanel'
import ARIASettings from '@/components/agent/ARIASettings'
import SuggestedPrompts from '@/components/agent/SuggestedPrompts'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

type RightPanel = 'none' | 'memory' | 'settings'

export default function ARIAPage() {
  const { isMobile } = useBreakpoint()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const {
    conversationId,
    messages,
    isThinking,
    setConversationId,
    addUserMessage,
    addAssistantMessage,
    setThinking,
    loadMessages,
    startNewConversation,
  } = useAgentStore()

  const [input, setInput] = useState('')
  const [rightPanel, setRightPanel] = useState<RightPanel>('none')
  const [showSidebar, setShowSidebar] = useState(!isMobile)
  const [isVoiceInput, setIsVoiceInput] = useState(false)

  // Speech recognition for voice input
  const { data: agentSettings } = useQuery({
    queryKey: ['agent-settings'],
    queryFn: agentApi.getSettings,
    staleTime: 60_000,
  })

  const speechLang = agentSettings?.language_preference === 'ml' ? 'ml-IN' : 'en-US'
  const speech = useSpeechRecognition()

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  // Voice input: fill textarea with transcript
  useEffect(() => {
    if (speech.transcript || speech.interimTranscript) {
      setInput(speech.transcript + (speech.interimTranscript ? ` ${speech.interimTranscript}` : ''))
    }
  }, [speech.transcript, speech.interimTranscript])

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: ({ message, convId }: { message: string; convId?: string }) =>
      agentApi.chat(message, convId),
    onSuccess: (data) => {
      addAssistantMessage(
        data.response,
        data.tool_calls,
        data.cards_referenced,
        data.actions,
      )
      setConversationId(data.conversation_id)
      queryClient.invalidateQueries({ queryKey: ['agent-conversations'] })
      queryClient.invalidateQueries({ queryKey: ['agent-status'] })

      // Handle special frontend actions
      for (const action of data.actions || []) {
        if (action.type === 'start_timer' && action.minutes) {
          // Navigate to timer page and start timer
          toast.success(`Starting ${action.minutes}min focus timer: ${action.label}`)
          // The timer store will be updated — user can see it in the timer page
        }
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.response || 'Something went wrong. Please try again.'
      addAssistantMessage(msg)
      toast.error('ARIA encountered an error')
    },
  })

  const sendMessage = useCallback(
    (text?: string) => {
      const messageText = (text || input).trim()
      if (!messageText || chatMutation.isPending) return

      // Stop voice input if active
      if (isVoiceInput) {
        speech.stop()
        speech.reset()
        setIsVoiceInput(false)
      }

      addUserMessage(messageText)
      setInput('')
      setThinking(true)

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }

      chatMutation.mutate({
        message: messageText,
        convId: conversationId || undefined,
      })
    },
    [input, conversationId, chatMutation, addUserMessage, setThinking, isVoiceInput, speech]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleVoiceToggle = () => {
    if (isVoiceInput) {
      speech.stop()
      speech.reset()
      setIsVoiceInput(false)
    } else {
      speech.reset()
      speech.start(speechLang)
      setIsVoiceInput(true)
    }
  }

  const handleSelectConversation = async (id: string) => {
    try {
      const conv = await agentApi.getConversation(id)
      loadMessages(conv.messages)
      setConversationId(id)
      if (isMobile) setShowSidebar(false)
    } catch (e) {
      toast.error('Failed to load conversation')
    }
  }

  const handleNewConversation = () => {
    startNewConversation()
    if (isMobile) setShowSidebar(false)
  }

  const toggleRightPanel = (panel: RightPanel) => {
    setRightPanel((prev) => (prev === panel ? 'none' : panel))
  }

  const ariaName = agentSettings?.aria_name || 'ARIA'

  return (
    <div className="flex h-[calc(100vh-56px)] -m-4 md:-m-8 overflow-hidden">
      {/* ── Conversation Sidebar ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={isMobile ? { x: '-100%' } : { opacity: 0 }}
            animate={isMobile ? { x: 0 } : { opacity: 1 }}
            exit={isMobile ? { x: '-100%' } : { opacity: 0 }}
            className={cn(
              'w-60 flex-shrink-0',
              isMobile && 'fixed inset-y-0 left-0 z-50 shadow-2xl'
            )}
          >
            <ConversationSidebar
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              onViewMemory={() => toggleRightPanel('memory')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar backdrop */}
      {isMobile && showSidebar && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* ── Main Chat Area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-dark-bg">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-surface/80 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors"
            >
              <ChevronLeft
                className={cn(
                  'w-4 h-4 text-dark-text-muted transition-transform',
                  !showSidebar && 'rotate-180'
                )}
              />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-cyan/20 to-accent-indigo/20 border border-accent-cyan/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dark-text-primary">{ariaName}</p>
                {agentSettings && (
                  <p className="text-xs text-dark-text-muted">
                    {agentSettings.llm_model} · {agentSettings.llm_provider}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right panel toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleRightPanel('memory')}
              className={cn(
                'p-2 rounded-xl transition-all',
                rightPanel === 'memory'
                  ? 'bg-accent-cyan/10 text-accent-cyan'
                  : 'hover:bg-dark-hover text-dark-text-muted'
              )}
              title="Memory"
            >
              <Brain className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleRightPanel('settings')}
              className={cn(
                'p-2 rounded-xl transition-all',
                rightPanel === 'settings'
                  ? 'bg-accent-cyan/10 text-accent-cyan'
                  : 'hover:bg-dark-hover text-dark-text-muted'
              )}
              title="Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto scrollbar-custom px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <SuggestedPrompts onSelect={sendMessage} />
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  toolCalls={msg.tool_calls}
                  cardsCited={msg.cards_cited}
                />
              ))}

              {/* Thinking indicator */}
              {isThinking && (
                <MessageBubble
                  role="assistant"
                  content=""
                  isThinking
                />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-dark-border bg-dark-surface/80 backdrop-blur-xl p-4">
          {/* Voice indicator */}
          {isVoiceInput && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-accent-amber/10 border border-accent-amber/20 rounded-xl"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-accent-amber"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-xs text-accent-amber">
                {speech.isListening ? 'Listening...' : 'Voice input active'}
              </span>
            </motion.div>
          )}

          <div className="flex items-end gap-3">
            {/* Voice button */}
            <button
              onClick={handleVoiceToggle}
              className={cn(
                'p-2.5 rounded-xl transition-all flex-shrink-0',
                isVoiceInput
                  ? 'bg-accent-amber text-dark-bg'
                  : 'bg-dark-elevated border border-dark-border text-dark-text-muted hover:border-accent-amber/50 hover:text-accent-amber'
              )}
              title={isVoiceInput ? 'Stop voice input' : 'Voice input'}
            >
              {isVoiceInput ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${ariaName}... (Enter to send, Shift+Enter for newline)`}
                rows={1}
                className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-2xl text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent resize-none text-sm leading-relaxed"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>

            {/* Send button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || chatMutation.isPending}
              className="p-2.5 rounded-xl bg-accent-cyan text-dark-bg hover:bg-accent-cyan/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {chatMutation.isPending ? (
                <motion.div
                  className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Memory / Settings) ─────────────────────────────── */}
      <AnimatePresence>
        {rightPanel !== 'none' && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-shrink-0 overflow-hidden"
          >
            {rightPanel === 'memory' && (
              <MemoryPanel onClose={() => setRightPanel('none')} />
            )}
            {rightPanel === 'settings' && (
              <ARIASettings onClose={() => setRightPanel('none')} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
