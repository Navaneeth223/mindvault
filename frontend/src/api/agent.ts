/**
 * ARIA Agent API
 * ─────────────────────────────────────────────────────────────────────────────
 * All API calls for the ARIA agent: chat, conversations, memory, settings.
 */
import client from './client'

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string
  tool_calls: ToolCall[]
  created_at: string
  cards_cited: string[]
}

export interface ToolCall {
  tool: string
  arguments: Record<string, any>
  result: string
}

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export interface ConversationDetail extends Conversation {
  messages: AgentMessage[]
}

export interface PersonalFact {
  id: string
  category: 'goal' | 'skill' | 'preference' | 'context' | 'achievement' | 'habit'
  fact: string
  confidence: number
  source: string
  created_at: string
}

export interface AgentSettings {
  llm_provider: 'ollama' | 'openai' | 'claude' | 'gemini'
  llm_model: string
  ollama_url: string
  has_api_key: boolean
  auto_tag_cards: boolean
  auto_summarise: boolean
  daily_briefing: boolean
  briefing_time: string
  proactive_reminders: boolean
  memory_enabled: boolean
  aria_name: string
  language_preference: 'en' | 'ml'
  last_indexed_at: string | null
  total_indexed: number
}

export interface AgentStatus {
  llm_available: boolean
  llm_status: string
  llm_provider: string
  llm_model: string
  indexed_cards: number
  total_cards: number
  facts_count: number
  memory_enabled: boolean
}

export interface ChatResponse {
  response: string
  tool_calls: ToolCall[]
  cards_referenced: string[]
  conversation_id: string
  actions: AgentAction[]
}

export interface AgentAction {
  type: 'start_timer'
  minutes?: number
  label?: string
}

export const agentApi = {
  // ── Chat ──────────────────────────────────────────────────────────────────
  chat: async (message: string, conversationId?: string): Promise<ChatResponse> => {
    const response = await client.post('/api/agent/chat/', {
      message,
      conversation_id: conversationId,
    })
    return response.data
  },

  // ── Conversations ─────────────────────────────────────────────────────────
  listConversations: async (): Promise<Conversation[]> => {
    const response = await client.get('/api/agent/conversations/')
    return response.data
  },

  getConversation: async (id: string): Promise<ConversationDetail> => {
    const response = await client.get(`/api/agent/conversations/${id}/`)
    return response.data
  },

  deleteConversation: async (id: string): Promise<void> => {
    await client.delete(`/api/agent/conversations/${id}/`)
  },

  // ── Memory ────────────────────────────────────────────────────────────────
  getMemoryFacts: async (): Promise<PersonalFact[]> => {
    const response = await client.get('/api/agent/memory/')
    return response.data
  },

  addMemoryFact: async (fact: string, category: string): Promise<PersonalFact> => {
    const response = await client.post('/api/agent/memory/add/', { fact, category })
    return response.data
  },

  editMemoryFact: async (id: string, fact: string): Promise<void> => {
    await client.patch('/api/agent/memory/', { id, action: 'edit', fact })
  },

  deleteMemoryFact: async (id: string): Promise<void> => {
    await client.patch('/api/agent/memory/', { id, action: 'delete' })
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  getSettings: async (): Promise<AgentSettings> => {
    const response = await client.get('/api/agent/settings/')
    return response.data
  },

  updateSettings: async (data: Partial<AgentSettings> & { api_key?: string }): Promise<void> => {
    await client.patch('/api/agent/settings/', data)
  },

  // ── Vault Indexing ────────────────────────────────────────────────────────
  reindexVault: async (): Promise<{ status: string; task_id: string }> => {
    const response = await client.post('/api/agent/reindex/')
    return response.data
  },

  // ── Status ────────────────────────────────────────────────────────────────
  getStatus: async (): Promise<AgentStatus> => {
    const response = await client.get('/api/agent/status/')
    return response.data
  },
}
