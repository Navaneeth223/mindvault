/**
 * Capture Type Selector
 * ─────────────────────────────────────────────────────────────────────────────
 * Horizontal scrollable type chips
 */
import { motion } from 'framer-motion'
import { Link2, FileText, Code2, Upload, MessageSquare, Mic, Music2, LucideIcon } from 'lucide-react'

export type CaptureType = 'url' | 'note' | 'code' | 'file' | 'chat' | 'voice' | 'music'

interface CaptureTypeOption {
  type: CaptureType
  label: string
  icon: LucideIcon
  color: string
}

const CAPTURE_TYPES: CaptureTypeOption[] = [
  { type: 'url',   label: 'Link',  icon: Link2,        color: '#00f5d4' },
  { type: 'note',  label: 'Note',  icon: FileText,     color: '#6366f1' },
  { type: 'code',  label: 'Code',  icon: Code2,        color: '#10b981' },
  { type: 'music', label: 'Music', icon: Music2,       color: '#f5a623' },
  { type: 'file',  label: 'File',  icon: Upload,       color: '#f59e0b' },
  { type: 'chat',  label: 'Chat',  icon: MessageSquare, color: '#ec4899' },
  { type: 'voice', label: 'Voice', icon: Mic,          color: '#f5a623' },
]

interface CaptureTypeSelectorProps {
  selected: CaptureType
  onChange: (type: CaptureType) => void
}

export default function CaptureTypeSelector({ selected, onChange }: CaptureTypeSelectorProps) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CAPTURE_TYPES.map((option) => {
          const Icon = option.icon
          const isSelected = selected === option.type

          return (
            <motion.button
              key={option.type}
              type="button"
              onClick={() => onChange(option.type)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 whitespace-nowrap ${
                isSelected
                  ? 'border-transparent shadow-soft-lg'
                  : 'border-dark-border hover:border-dark-text-muted'
              }`}
              style={{
                backgroundColor: isSelected ? `${option.color}15` : 'transparent',
                color: isSelected ? option.color : 'var(--color-text-secondary)',
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{option.label}</span>

              {/* Active indicator */}
              {isSelected && (
                <motion.div
                  layoutId="activeType"
                  className="absolute inset-0 rounded-xl border-2"
                  style={{ borderColor: option.color }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
