/**
 * Code Capture Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Code snippet editor with language detection
 */
import { useState } from 'react'
import { Code2, ChevronDown } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface CodeCaptureProps {
  onSave: (data: { title: string; body: string; language: string }) => void
  onCancel: () => void
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'plaintext', label: 'Plain Text' },
]

export default function CodeCapture({ onSave, onCancel }: CodeCaptureProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [language, setLanguage] = useState('javascript')

  const handleSave = () => {
    onSave({
      title: title.trim() || `${LANGUAGES.find((l) => l.value === language)?.label} Snippet`,
      body: body.trim(),
      language,
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
          <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Code snippet title (optional)"
            className="pl-12"
            autoFocus
          />
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Language
        </label>
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2.5 pr-10 bg-dark-elevated border border-dark-border rounded-2xl text-dark-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Code Editor */}
      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Code
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Paste your code here..."
          rows={14}
          className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-2xl text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent resize-none font-mono text-sm leading-relaxed"
          spellCheck={false}
        />
        <p className="mt-1.5 text-xs text-dark-text-muted">
          {body.split('\n').length} lines • {body.length} characters
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!canSave} className="flex-1">
          Save Code
        </Button>
      </div>
    </div>
  )
}
