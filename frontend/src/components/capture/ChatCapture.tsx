/**
 * Chat Capture Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Chat excerpt/conversation capture
 */
import { useState } from 'react'
import { MessageSquare, ChevronDown } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface ChatCaptureProps {
  onSave: (data: { title: string; body: string; source: string }) => void
  onCancel: () => void
}

const CHAT_SOURCES = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'slack', label: 'Slack' },
  { value: 'discord', label: 'Discord' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'imessage', label: 'iMessage' },
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
  { value: 'other', label: 'Other' },
]

export default function ChatCapture({ onSave, onCancel }: ChatCaptureProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [source, setSource] = useState('whatsapp')

  const handleSave = () => {
    onSave({
      title: title.trim() || `${CHAT_SOURCES.find((s) => s.value === source)?.label} Chat`,
      body: body.trim(),
      source,
    })
  }

  const canSave = body.trim().length > 0

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Title
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chat title (optional)"
            className="pl-12"
            autoFocus
          />
        </div>
      </div>

      {/* Source */}
      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Source
        </label>
        <div className="relative">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-4 py-2.5 pr-10 bg-dark-elevated border border-dark-border rounded-2xl text-dark-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent cursor-pointer"
          >
            {CHAT_SOURCES.map((src) => (
              <option key={src.value} value={src.value}>
                {src.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Chat Content */}
      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Chat Excerpt
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Paste your chat conversation here..."
          rows={12}
          className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-2xl text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent resize-none text-sm leading-relaxed"
        />
        <p className="mt-1.5 text-xs text-dark-text-muted">
          Copy and paste important conversations to save them
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!canSave} className="flex-1">
          Save Chat
        </Button>
      </div>
    </div>
  )
}
