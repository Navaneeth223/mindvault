/**
 * ARIA Agent Store
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages conversation state, messages, and thinking indicator.
 */
import { create } from 'zustand'
import { AgentMessage, ToolCall, AgentAction } from '@/api/agent'

interface LocalMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  tool_calls?: ToolCall[]
  cards_cited?: string[]
  actions?: AgentAction[]
  isThinking?: boolean
  created_at: string
}

interface AgentState {
  // Current conversation
  conversationId: string | null
  messages: LocalMessage[]
  isThinking: boolean

  // Actions
  setConversationId: (id: string | null) => void
  addUserMessage: (content: string) => string
  addAssistantMessage: (
    content: string,
    toolCalls?: ToolCall[],
    cardsCited?: string[],
    actions?: AgentAction[]
  ) => void
  setThinking: (thinking: boolean) => void
  loadMessages: (messages: AgentMessage[]) => void
  clearMessages: () => void
  startNewConversation: () => void
}

export const useAgentStore = create<AgentState>((set, get) => ({
  conversationId: null,
  messages: [],
  isThinking: false,

  setConversationId: (id) => set({ conversationId: id }),

  addUserMessage: (content) => {
    const id = `user-${Date.now()}`
    const msg: LocalMessage = {
      id,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }
    set((state) => ({ messages: [...state.messages, msg] }))
    return id
  },

  addAssistantMessage: (content, toolCalls = [], cardsCited = [], actions = []) => {
    const msg: LocalMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content,
      tool_calls: toolCalls,
      cards_cited: cardsCited,
      actions,
      created_at: new Date().toISOString(),
    }
    set((state) => ({ messages: [...state.messages, msg], isThinking: false }))
  },

  setThinking: (thinking) => set({ isThinking: thinking }),

  loadMessages: (messages) => {
    const localMessages: LocalMessage[] = messages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      tool_calls: m.tool_calls,
      cards_cited: m.cards_cited,
      created_at: m.created_at,
    }))
    set({ messages: localMessages })
  },

  clearMessages: () => set({ messages: [] }),

  startNewConversation: () =>
    set({ conversationId: null, messages: [], isThinking: false }),
}))
