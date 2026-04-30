/**
 * GitHub Card
 * ─────────────────────────────────────────────────────────────────────────────
 * GitHub repository card with stars and language
 */
import { Star, GitFork, Code2 } from 'lucide-react'
import { Card } from '@/api/cards'

interface GitHubCardProps {
  card: Card
}

const languageColors: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
}

export default function GitHubCard({ card }: GitHubCardProps) {
  const stars = card.metadata?.stars || 0
  const language = card.metadata?.language || ''
  const topics = card.metadata?.topics || []

  return (
    <>
      {/* Header */}
      <div className="p-4 bg-gradient-to-br from-dark-elevated to-dark-surface border-b border-dark-border">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-dark-bg flex items-center justify-center flex-shrink-0">
            <Code2 className="w-5 h-5 text-dark-text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-mono font-semibold text-dark-text-primary mb-1 truncate group-hover:text-accent-cyan transition-colors">
              {card.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-dark-text-muted">
              {stars > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>{stars.toLocaleString()}</span>
                </div>
              )}
              {language && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: languageColors[language] || '#8b949e' }}
                  />
                  <span>{language}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Description */}
        {card.description && (
          <p className="text-sm text-dark-text-secondary mb-3 line-clamp-3">
            {card.description}
          </p>
        )}

        {/* Topics */}
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topics.slice(0, 4).map((topic: string) => (
              <span
                key={topic}
                className="px-2 py-0.5 text-xs bg-accent-indigo/10 border border-accent-indigo/20 rounded-lg text-accent-indigo"
              >
                {topic}
              </span>
            ))}
            {topics.length > 4 && (
              <span className="px-2 py-0.5 text-xs text-dark-text-muted">
                +{topics.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  )
}
