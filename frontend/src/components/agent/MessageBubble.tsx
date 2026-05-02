/**
 * Message Bubble
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a single chat message — user (right) or ARIA (left, no bubble).
 */
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { ToolCall } from '@/api/agent'
import ToolCallAccordion from './ToolCallAccordion'
import CardsCited from './CardsCited'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCall[]
  cardsCited?: string[]
  isThinking?: boolean
}

// Simple markdown renderer (bold, code, lists)
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Code block (simplified)
    if (line.startsWith('```')) {
      return <div key={i} className="my-1 text-xs text-dark-text-muted font-mono">{line}</div>
    }
    // Heading
    if (line.startsWith('## ')) {
      return <p key={i} className="font-semibold text-dark-text-primary mt-3 mb-1">{line.slice(3)}</p>
    }
    if (line.startsWith('# ')) {
      return <p key={i} className="font-serif font-bold text-lg text-dark-text-primary mt-3 mb-1">{line.slice(2)}</p>
    }
    // Bullet
    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <div key={i} className="flex gap-2 my-0.5">
          <span className="text-accent-cyan mt-1 flex-shrink-0">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      )
    }
    // Empty line
    if (!line.trim()) return <div key={i} className="h-2" />
    // Normal paragraph
    return <p key={i} className="my-0.5 leading-relaxed">{renderInline(line)}</p>
  })
}

function renderInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-dark-text-primary">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 bg-dark-elevated rounded text-xs font-mono text-accent-cyan">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

// Thinking indicator — 3 animated dots
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-accent-cyan"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

export default function MessageBubble({
  role,
  content,
  toolCalls = [],
  cardsCited = [],
  isThinking = false,
}: MessageBubbleProps) {
  if (role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[80%] px-4 py-3 bg-dark-elevated border-r-[3px] border-accent-cyan rounded-2xl rounded-tr-sm">
          <p className="text-sm text-dark-text-primary leading-relaxed">{content}</p>
        </div>
      </motion.div>
    )
  }

  // ARIA message — no bubble, just text with icon
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3 max-w-[90%]"
    >
      {/* ARIA icon */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-cyan/20 to-accent-indigo/20 border border-accent-cyan/30 flex items-center justify-center flex-shrink-0 mt-1">
        <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* Content */}
        {isThinking ? (
          <ThinkingDots />
        ) : (
          <div className="text-sm text-dark-text-primary">
            {renderMarkdown(content)}
          </div>
        )}

        {/* Tool calls accordion */}
        {toolCalls.length > 0 && (
          <ToolCallAccordion toolCalls={toolCalls} />
        )}

        {/* Cards cited */}
        {cardsCited.length > 0 && (
          <CardsCited cardIds={cardsCited} />
        )}
      </div>
    </motion.div>
  )
}
