/**
 * Suggested Prompts
 * ─────────────────────────────────────────────────────────────────────────────
 * Quick-tap prompt chips shown when the conversation is empty.
 */
import { motion } from 'framer-motion'

const PROMPTS = [
  { label: 'What did I save today?', icon: '📅' },
  { label: 'What are my goals?', icon: '🎯' },
  { label: 'Start a 25 min focus session', icon: '⏱️' },
  { label: 'Show my vault stats', icon: '📊' },
  { label: 'Give me a random card to revisit', icon: '🎲' },
  { label: 'What Django resources have I saved?', icon: '🐍' },
]

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void
}

export default function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col items-center justify-center h-full px-6 py-12"
    >
      {/* ARIA intro */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-indigo/20 border border-accent-cyan/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✦</span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-dark-text-primary mb-2">
          Hi, I'm ARIA
        </h2>
        <p className="text-dark-text-muted max-w-sm">
          Your personal AI second brain. I know everything you've saved and remember what matters to you.
        </p>
      </div>

      {/* Prompt chips */}
      <div className="flex flex-wrap gap-2 justify-center max-w-lg">
        {PROMPTS.map((p, i) => (
          <motion.button
            key={p.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(p.label)}
            className="flex items-center gap-2 px-4 py-2.5 bg-dark-elevated border border-dark-border rounded-2xl text-sm text-dark-text-secondary hover:border-accent-cyan/40 hover:text-dark-text-primary hover:bg-dark-hover transition-all"
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
