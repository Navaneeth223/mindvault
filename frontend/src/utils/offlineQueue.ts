/**
 * Offline Queue
 * ─────────────────────────────────────────────────────────────────────────────
 * IndexedDB queue for offline card captures
 */
import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface QueuedCard {
  id: string
  type: string
  data: any
  timestamp: number
  retries: number
}

interface OfflineQueueDB extends DBSchema {
  queue: {
    key: string
    value: QueuedCard
    indexes: { timestamp: number }
  }
}

const DB_NAME = 'mindvault-offline'
const DB_VERSION = 1
const STORE_NAME = 'queue'

let db: IDBPDatabase<OfflineQueueDB> | null = null

// Initialize database
async function getDB() {
  if (db) return db

  db = await openDB<OfflineQueueDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp')
      }
    },
  })

  return db
}

// Add card to queue
export async function queueCard(type: string, data: any): Promise<string> {
  const db = await getDB()
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const queuedCard: QueuedCard = {
    id,
    type,
    data,
    timestamp: Date.now(),
    retries: 0,
  }

  await db.add(STORE_NAME, queuedCard)
  return id
}

// Get all queued cards
export async function getQueuedCards(): Promise<QueuedCard[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

// Get queued card by ID
export async function getQueuedCard(id: string): Promise<QueuedCard | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, id)
}

// Remove card from queue
export async function removeQueuedCard(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

// Update card retry count
export async function incrementRetries(id: string): Promise<void> {
  const db = await getDB()
  const card = await db.get(STORE_NAME, id)

  if (card) {
    card.retries += 1
    await db.put(STORE_NAME, card)
  }
}

// Clear all queued cards
export async function clearQueue(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
}

// Get queue count
export async function getQueueCount(): Promise<number> {
  const db = await getDB()
  return db.count(STORE_NAME)
}

// Process queue (sync with server)
export async function processQueue(
  onProcess: (card: QueuedCard) => Promise<boolean>
): Promise<{ success: number; failed: number }> {
  const cards = await getQueuedCards()
  let success = 0
  let failed = 0

  for (const card of cards) {
    try {
      const processed = await onProcess(card)

      if (processed) {
        await removeQueuedCard(card.id)
        success++
      } else {
        await incrementRetries(card.id)
        failed++
      }
    } catch (error) {
      console.error('Queue processing error:', error)
      await incrementRetries(card.id)
      failed++
    }
  }

  return { success, failed }
}
