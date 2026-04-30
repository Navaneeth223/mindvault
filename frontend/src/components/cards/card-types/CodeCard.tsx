/**
 * Code Card
 * ─────────────────────────────────────────────────────────────────────────────
 * Code snippet card with syntax highlighting
 */
import { Code2, Copy } from 'lucide-react'
import { Card } from '@/api/cards'

interface CodeCardProps {
  card: Card
}

const languageColors: Record<string, string> = {
  javascript: '#f1e05a',
  typescript: '#3178c6',
  python: '#3572A5',
  java: '#b07219',
  go: '#00ADD8',
  rust: '#dea584',
  ruby: '#701516',
  php: '#4F5D95',
}

export default function CodeCard({ card }: CodeCardProps) {
  const language = card.metadata?.language || 'text'
  const preview = (card.body || '').split('\n').slice(0, 10).join('\n')

  return (
    <>
      {/* Header */}
      <div className="p-4 bg-dark-elevated border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-dark-surface flex items-center justify-center">
              <Code2 className="w-4 h-4 text-accent-cyan" />
            </div>
            <div>
              <h3 className="font-semibold text-dark-text-primary text-sm line-clamp-1 group-hover:text-accent-cyan transition-colors">
                {card.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      languageColors[language.toLowerCase()] || '#8b949e',
                  }}
                />
                <span className="text-xs text-dark-text-muted capitalize">
                  {language}
                </span>
              </div>
            </div>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors opacity-0 group-hover:opacity-100">
            <Copy className="w-4 h-4 text-dark-text-muted" />
          </button>
        </div>
      </div>

      {/* Code Preview */}
      <div className="p-4 bg-dark-bg/50">
        <pre className="text-xs font-mono text-dark-text-secondary overflow-hidden">
          <code className="line-clamp-8">
            {preview || <span className="italic text-dark-text-muted">No code yet</span>}
          </code>
        </pre>
      </div>
    </>
  )
}
