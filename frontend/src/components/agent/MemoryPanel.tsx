/**
 * Memory Panel
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows and manages ARIA's personal facts about the user.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Plus, Edit2, Check, Brain, Target, Zap, Heart, MapPin, Trophy, Repeat } from 'lucide-react'
import { agentApi, PersonalFact } from '@/api/agent'
import toast from 'react-hot-toast'

const CATEGORY_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  goal:        { icon: Target,  label: 'Goals',        color: '#00f5d4' },
  skill:       { icon: Zap,     label: 'Skills',       color: '#6366f1' },
  preference:  { icon: Heart,   label: 'Preferences',  color: '#ec4899' },
  context:     { icon: MapPin,  label: 'Context',      color: '#f5a623' },
  achievement: { icon: Trophy,  label: 'Achievements', color: '#10b981' },
  habit:       { icon: Repeat,  label: 'Habits',       color: '#8b5cf6' },
}

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as PersonalFact['category'][]

interface FactItemProps {
  fact: PersonalFact
  onDelete: (id: string) => void
  onEdit: (id: string, text: string) => void
}

function FactItem({ fact, onDelete, onEdit }: FactItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(fact.fact)
  const config = CATEGORY_CONFIG[fact.category]

  const handleSave = () => {
    if (editText.trim() && editText !== fact.fact) {
      onEdit(fact.id, editText.trim())
    }
    setIsEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-start gap-2 group"
    >
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: `${config.color}18` }}
      >
        <config.icon className="w-3 h-3" style={{ color: config.color }} />
      </div>

      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') setIsEditing(false)
            }}
            className="flex-1 px-2 py-1 bg-dark-elevated border border-accent-cyan rounded-lg text-sm text-dark-text-primary focus:outline-none"
            autoFocus
          />
          <button onClick={handleSave} className="p-1 text-accent-cyan hover:bg-accent-cyan/10 rounded">
            <Check className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-start justify-between gap-2">
          <p className="text-sm text-dark-text-secondary leading-relaxed">{fact.fact}</p>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded hover:bg-dark-hover transition-colors"
            >
              <Edit2 className="w-3 h-3 text-dark-text-muted" />
            </button>
            <button
              onClick={() => onDelete(fact.id)}
              className="p-1 rounded hover:bg-accent-red/10 transition-colors"
            >
              <X className="w-3 h-3 text-accent-red" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

interface MemoryPanelProps {
  onClose: () => void
}

export default function MemoryPanel({ onClose }: MemoryPanelProps) {
  const [addingFact, setAddingFact] = useState(false)
  const [newFact, setNewFact] = useState('')
  const [newCategory, setNewCategory] = useState<PersonalFact['category']>('context')
  const queryClient = useQueryClient()

  const { data: facts = [], isLoading } = useQuery({
    queryKey: ['agent-memory'],
    queryFn: agentApi.getMemoryFacts,
  })

  const deleteMutation = useMutation({
    mutationFn: agentApi.deleteMemoryFact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-memory'] })
      queryClient.invalidateQueries({ queryKey: ['agent-status'] })
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, fact }: { id: string; fact: string }) =>
      agentApi.editMemoryFact(id, fact),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agent-memory'] }),
  })

  const addMutation = useMutation({
    mutationFn: () => agentApi.addMemoryFact(newFact.trim(), newCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-memory'] })
      queryClient.invalidateQueries({ queryKey: ['agent-status'] })
      setNewFact('')
      setAddingFact(false)
      toast.success('Fact added to memory')
    },
  })

  // Group facts by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catFacts = facts.filter((f) => f.category === cat)
    if (catFacts.length > 0) acc[cat] = catFacts
    return acc
  }, {} as Record<string, PersonalFact[]>)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full flex flex-col bg-dark-surface border-l border-dark-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-accent-cyan" />
          <div>
            <h3 className="font-semibold text-dark-text-primary">What ARIA knows about you</h3>
            <p className="text-xs text-dark-text-muted">{facts.length} facts</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors">
          <X className="w-4 h-4 text-dark-text-muted" />
        </button>
      </div>

      {/* Facts list */}
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4 space-y-5">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-dark-elevated rounded animate-pulse" />
            ))}
          </div>
        ) : facts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Brain className="w-10 h-10 text-dark-text-muted mb-3" />
            <p className="text-sm text-dark-text-primary font-medium mb-1">No facts yet</p>
            <p className="text-xs text-dark-text-muted max-w-xs">
              ARIA learns about you as you chat. You can also add facts manually.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {Object.entries(grouped).map(([category, catFacts]) => {
              const config = CATEGORY_CONFIG[category]
              return (
                <motion.div key={category} layout>
                  <div className="flex items-center gap-2 mb-2">
                    <config.icon className="w-4 h-4" style={{ color: config.color }} />
                    <h4 className="text-xs font-semibold text-dark-text-muted uppercase tracking-wider">
                      {config.label} ({catFacts.length})
                    </h4>
                  </div>
                  <div className="space-y-2 pl-1">
                    {catFacts.map((fact) => (
                      <FactItem
                        key={fact.id}
                        fact={fact}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onEdit={(id, text) => editMutation.mutate({ id, fact: text })}
                      />
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Add fact */}
      <div className="p-4 border-t border-dark-border flex-shrink-0">
        <AnimatePresence mode="wait">
          {addingFact ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-2"
            >
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as PersonalFact['category'])}
                className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-xl text-sm text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_CONFIG[cat].label}
                  </option>
                ))}
              </select>
              <input
                value={newFact}
                onChange={(e) => setNewFact(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFact.trim()) addMutation.mutate()
                  if (e.key === 'Escape') setAddingFact(false)
                }}
                placeholder="e.g. I want to become a developer"
                className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-xl text-sm text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setAddingFact(false)}
                  className="flex-1 py-2 text-sm text-dark-text-muted hover:text-dark-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addMutation.mutate()}
                  disabled={!newFact.trim() || addMutation.isPending}
                  className="flex-1 py-2 bg-accent-cyan text-dark-bg text-sm font-medium rounded-xl hover:bg-accent-cyan/90 transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setAddingFact(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-dark-border rounded-xl text-sm text-dark-text-muted hover:border-accent-cyan/50 hover:text-accent-cyan transition-all"
            >
              <Plus className="w-4 h-4" />
              Add fact manually
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
