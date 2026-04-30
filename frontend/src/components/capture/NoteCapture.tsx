/**
 * Note Capture Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Markdown note editor
 */
import { useState } from 'react'
import { FileText } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface NoteCaptureProps {
  onSave: (data: { title: string; body: string }) => void
  onCancel: () => void
}

export default function NoteCapture({ onSave, onCancel }: NoteCaptureProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const handleSave = () => {
    onSave({ title: title.trim() || 'Untitled Note', body: body.trim() })
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
          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title (optional)"
            className="pl-12"
            autoFocus
          />
        </div>
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Content
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your note here... (Markdown supported)"
          rows={12}
          className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-2xl text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent resize-none font-mono text-sm leading-relaxed"
        />
        <p className="mt-1.5 text-xs text-dark-text-muted">
          Supports Markdown formatting
        </p>
      </div>

      {/* Preview hint */}
      {body.includes('#') || body.includes('**') || body.includes('`') ? (
        <div className="p-3 bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl">
          <p className="text-xs text-accent-cyan">
            ✨ Markdown detected! Your note will be beautifully formatted.
          </p>
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!canSave} className="flex-1">
          Save Note
        </Button>
      </div>
    </div>
  )
}
