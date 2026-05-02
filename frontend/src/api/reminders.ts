/**
 * Reminders API
 * ─────────────────────────────────────────────────────────────────────────────
 * Reminders are stored on Card model — these are convenience wrappers.
 */
import client from './client'
import { Card } from './cards'

export const remindersApi = {
  /**
   * GET /api/reminders/
   * Returns all upcoming reminders (not done, reminder_at >= now).
   */
  list: async (): Promise<Card[]> => {
    const response = await client.get('/api/reminders/')
    return response.data
  },

  /**
   * PATCH /api/reminders/{card_id}/
   * Snooze or mark a reminder as done.
   */
  update: async (
    cardId: string,
    action: 'done' | 'snooze',
    snoozeDuration?: '1h' | '3h' | '1d' | '1w'
  ): Promise<{ message: string; new_reminder_at?: string }> => {
    const response = await client.patch(`/api/reminders/${cardId}/`, {
      action,
      snooze_duration: snoozeDuration,
    })
    return response.data
  },
}
