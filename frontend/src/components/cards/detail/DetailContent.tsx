/**
 * Detail Content
 * ─────────────────────────────────────────────────────────────────────────────
 * Card metadata with inline editing
 */
import { useState, useRef, useEffect } from 'react'
import { Calendar, Eye } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Card, cardsApi } from '@/api/cards'
import TagInput from '@/components/ui/TagInput'
import CollectionSelect from '@/components/ui/CollectionSelect'
import ReminderPicker from '@/components/ui/ReminderPicker'

interface DetailContentProps {
  card: Card
}

export default function DetailContent({ card }: DetailContentProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [tags, setTags] = useState(card.tags || [])
  const [collection, setCollection] = useState(card.collection)
  const [reminder, setReminder] = useState(card.reminder_at)

  const titleRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const queryClient = useQueryClient()

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Card>) => cardsApi.update(card.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', card.id] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })

  // Focus title on edit
  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus()
      // Select all text
      const range = document.createRange()
      range.selectNodeContents(titleRef.current)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }, [editingTitle])

  // Focus description on edit
  useEffect(() => {
    if (editingDescription && descriptionRef.current) {
      descriptionRef.current.focus()
    }
  }, [editingDescription])

  const handleTitleSave = () => {
    const newTitle = titleRef.current?.textContent?.trim() || card.title
    if (newTitle !== card.title) {
      setTitle(newTitle)
      updateMutation.mutate({ title: newTitle })
    }
    setEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleSave()
    } else if (e.key === 'Escape') {
      setTitle(card.title)
      setEditingTitle(false)
    }
  }

  const handleDescriptionSave = () => {
    if (description !== card.description) {
      updateMutation.mutate({ description })
    }
    setEditingDescription(false)
  }

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDescription(card.description || '')
      setEditingDescription(false)
    }
  }

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags)
    updateMutation.mutate({ tags: newTags })
  }

  const handleCollectionChange = (newCollection: string | null) => {
    setCollection(newCollection)
    updateMutation.mutate({ collection: newCollection })
  }

  const handleReminderChange = (newReminder: string | null) => {
    setReminder(newReminder)
    updateMutation.mutate({ reminder_at: newReminder })
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Title */}
      <div>
        {editingTitle ? (
          <div
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            className="text-2xl font-serif font-semibold text-dark-text-primary bg-dark-elevated px-3 py-2 rounded-lg border-b-2 border-accent-cyan focus:outline-none"
          >
            {title}
          </div>
        ) : (
          <h1
            onClick={() => setEditingTitle(true)}
            className="text-2xl font-serif font-semibold text-dark-text-primary cursor-text hover:bg-dark-hover/50 px-3 py-2 rounded-lg transition-colors"
          >
            {title}
          </h1>
        )}
      </div>

      {/* Description */}
      <div>
        {editingDescription ? (
          <textarea
            ref={descriptionRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionSave}
            onKeyDown={handleDescriptionKeyDown}
            placeholder="Add a description..."
            rows={3}
            className="w-full px-3 py-2 bg-dark-elevated border-b-2 border-accent-cyan rounded-lg text-dark-text-secondary placeholder:text-dark-text-muted focus:outline-none resize-none"
          />
        ) : (
          <p
            onClick={() => setEditingDescription(true)}
            className="text-dark-text-secondary cursor-text hover:bg-dark-hover/50 px-3 py-2 rounded-lg transition-colors min-h-[2.5rem]"
          >
            {description || (
              <span className="text-dark-text-muted italic">Click to add description...</span>
            )}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Tags
        </label>
        <TagInput value={tags} onChange={handleTagsChange} />
      </div>

      {/* Collection */}
      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          Collection
        </label>
        <CollectionSelect value={collection} onChange={handleCollectionChange} />
      </div>

      {/* Metadata */}
      <div className="pt-4 border-t border-dark-border space-y-3">
        <div className="flex items-center gap-2 text-sm text-dark-text-muted">
          <Calendar className="w-4 h-4" />
          <span>Added {formatDistanceToNow(new Date(card.created_at), { addSuffix: true })}</span>
        </div>

        {card.last_viewed_at && (
          <div className="flex items-center gap-2 text-sm text-dark-text-muted">
            <Eye className="w-4 h-4" />
            <span>
              Last viewed {formatDistanceToNow(new Date(card.last_viewed_at), { addSuffix: true })}
            </span>
          </div>
        )}
      </div>

      {/* Reminder */}
      <div className="pt-4 border-t border-dark-border">
        <ReminderPicker value={reminder} onChange={handleReminderChange} />
      </div>
    </div>
  )
}
