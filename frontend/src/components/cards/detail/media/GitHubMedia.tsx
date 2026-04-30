/**
 * GitHub Media
 * ─────────────────────────────────────────────────────────────────────────────
 * GitHub repository display
 */
import { Star, GitFork, ExternalLink } from 'lucide-react'
import { Card } from '@/api/cards'

interface GitHubMediaProps {
  card: Card
}

export default function GitHubMedia({ card }: GitHubMediaProps) {
  const { metadata } = card

  return (
    <div className="bg-dark-elevated p-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-dark-surface flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-dark-text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-dark-text-primary mb-1">
            {metadata?.owner}/{metadata?.repo}
          </h3>
          <div className="flex items-center gap-4 text-sm">
            {metadata?.stars && (
              <div className="flex items-center gap-1 text-dark-text-muted">
                <Star className="w-4 h-4" />
                <span>{metadata.stars.toLocaleString()}</span>
              </div>
            )}
            {metadata?.forks && (
              <div className="flex items-center gap-1 text-dark-text-muted">
                <GitFork className="w-4 h-4" />
                <span>{metadata.forks.toLocaleString()}</span>
              </div>
            )}
            {metadata?.language && (
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: metadata.language_color || '#6366f1' }}
                />
                <span className="text-dark-text-muted">{metadata.language}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {card.description && (
        <p className="text-sm text-dark-text-secondary mb-4 leading-relaxed">
          {card.description}
        </p>
      )}

      {/* README preview */}
      {metadata?.readme && (
        <div className="mt-4 pt-4 border-t border-dark-border">
          <p className="text-xs text-dark-text-muted mb-2">README.md</p>
          <div className="text-sm text-dark-text-secondary leading-relaxed line-clamp-6">
            {metadata.readme.substring(0, 500)}
            {metadata.readme.length > 500 && '...'}
          </div>
        </div>
      )}

      {/* View on GitHub */}
      <a
        href={card.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-dark-surface hover:bg-dark-hover border border-dark-border rounded-lg text-sm text-dark-text-primary transition-colors"
      >
        View on GitHub
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  )
}
