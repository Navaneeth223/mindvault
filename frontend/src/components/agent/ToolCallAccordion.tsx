/**
 * Tool Call Accordion
 * ─────────────────────────────────────────────────────────────────────────────
 * Collapsible section showing which tools ARIA used and what they returned.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Save, Bell, Globe, FileText, BarChart2, Clock, Brain, Timer } from 'lucide-react'
import { ToolCall } from '@/api/agent'

const TOOL_ICONS: Record<string, any> = {
  search_vault: Search,
  save_card: Save,
  set_reminder: Bell,
  web_search: Globe,
  summarise_url: Globe,
  create_note: FileText,
  get_vault_stats: BarChart2,
  list_reminders: Clock,
  remember_fact: Brain,
  start_timer: Timer,
}

const TOOL_LABELS: Record<string, string> = {
  search_vault: 'Searched vault',
  save_card: 'Saved to vault',
  set_reminder: 'Set reminder',
  web_search: 'Searched web',
  summarise_url: 'Fetched URL',
  create_note: 'Created note',
  get_vault_stats: 'Got vault stats',
  list_reminders: 'Listed reminders',
  remember_fact: 'Remembered fact',
  start_timer: 'Started timer',
}

interface ToolCallAccordionProps {
  toolCalls: ToolCall[]
}

export default function ToolCallAccordion({ toolCalls }: ToolCallAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (toolCalls.length === 0) return null

  return (
    <div className="border border-dark-border rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-dark-elevated hover:bg-dark-hover transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {toolCalls.slice(0, 3).map((tc, i) => {
              const Icon = TOOL_ICONS[tc.tool] || Search
              return (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center"
                >
                  <Icon className="w-2.5 h-2.5 text-accent-cyan" />
                </div>
              )
            })}
          </div>
          <span className="text-xs text-dark-text-muted">
            Used {toolCalls.length} tool{toolCalls.length !== 1 ? 's' : ''}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-dark-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-dark-border">
              {toolCalls.map((tc, i) => {
                const Icon = TOOL_ICONS[tc.tool] || Search
                const label = TOOL_LABELS[tc.tool] || tc.tool

                // Format arguments as readable string
                const argsStr = Object.entries(tc.arguments)
                  .map(([k, v]) => `${k}: "${v}"`)
                  .join(', ')

                return (
                  <div key={i} className="px-3 py-2.5 bg-dark-surface">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                        <Icon className="w-3 h-3 text-accent-cyan" />
                      </div>
                      <span className="text-xs font-medium text-dark-text-primary">
                        ✓ {label}
                      </span>
                      {argsStr && (
                        <span className="text-xs text-dark-text-muted truncate">
                          ({argsStr})
                        </span>
                      )}
                    </div>
                    {tc.result && (
                      <p className="text-xs text-dark-text-muted pl-7 line-clamp-3 font-mono">
                        {tc.result}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
