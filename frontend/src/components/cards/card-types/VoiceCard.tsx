/**
 * Voice Card
 * ─────────────────────────────────────────────────────────────────────────────
 * Voice note card with waveform visualization
 */
import { Mic, Clock } from 'lucide-react'
import { Card } from '@/api/cards'

interface VoiceCardProps {
  card: Card
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function VoiceCard({ card }: VoiceCardProps) {
  const duration = card.metadata?.duration || 0

  return (
    <>
      {/* Waveform Visualization */}
      <div className="p-6 bg-gradient-to-br from-accent-amber/10 to-accent-amber/5 border-b border-dark-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-amber/20 flex items-center justify-center flex-shrink-0">
            <Mic className="w-6 h-6 text-accent-amber" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-dark-text-primary mb-1 line-clamp-1 group-hover:text-accent-cyan transition-colors">
              {card.title}
            </h3>
            {duration > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-dark-text-muted">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(duration)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Simple Waveform Bars */}
        <div className="flex items-center justify-center gap-1 h-16">
          {[...Array(40)].map((_, i) => {
            const height = Math.random() * 60 + 20
            return (
              <div
                key={i}
                className="w-1 bg-accent-amber/40 rounded-full transition-all duration-300 group-hover:bg-accent-amber/60"
                style={{ height: `${height}%` }}
              />
            )
          })}
        </div>
      </div>

      {/* Transcript Preview */}
      {card.transcript && (
        <div className="p-4">
          <p className="text-sm text-dark-text-secondary line-clamp-4">
            {card.transcript}
          </p>
        </div>
      )}
    </>
  )
}
