/**
 * Timer API
 * ─────────────────────────────────────────────────────────────────────────────
 * Focus timer session management and statistics.
 */
import client from './client'

export interface TimerSession {
  id: string
  session_type: 'focus' | 'short_break' | 'long_break'
  duration: number          // planned seconds
  actual_time: number       // seconds actually completed
  completed: boolean
  abandoned: boolean
  linked_card: string | null
  linked_card_title: string | null
  note: string
  started_at: string
  ended_at: string | null
  created_at: string
  completion_percentage: number
}

export interface TimerStats {
  period: string
  total_focus_seconds: number
  total_focus_minutes: number
  completed_sessions: number
  abandoned_sessions: number
  streak_days: number
}

export interface CreateTimerSession {
  session_type: 'focus' | 'short_break' | 'long_break'
  duration: number
  actual_time: number
  completed: boolean
  abandoned?: boolean
  linked_card?: string | null
  note?: string
  started_at: string
  ended_at?: string | null
}

export const timerApi = {
  listSessions: async (params?: Record<string, any>): Promise<{ results: TimerSession[]; count: number }> => {
    const response = await client.get('/api/timer/sessions/', { params })
    return response.data
  },

  createSession: async (data: CreateTimerSession): Promise<TimerSession> => {
    const response = await client.post('/api/timer/sessions/', data)
    return response.data
  },

  updateSession: async (id: string, data: Partial<TimerSession>): Promise<TimerSession> => {
    const response = await client.patch(`/api/timer/sessions/${id}/`, data)
    return response.data
  },

  getStats: async (period: 'today' | 'week' | 'month' = 'today'): Promise<TimerStats> => {
    const response = await client.get('/api/timer/sessions/stats/', { params: { period } })
    return response.data
  },
}
