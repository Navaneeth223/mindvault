/**
 * Reminders Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows all cards with reminders, grouped by status.
 */
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, BellOff, Check, Clock, Calendar, ChevronRight } from 'lucide-react'
import { formatDistanceToNow, format, isPast, isToday, isTomorrow } from 'date-fns'
import { cardsApi, Card } from '@/api/cards'
import { useUIStore } from '@/store/uiStore'
import toast from 'react-hot-toast'

function ReminderCard({ card }: { card: Card }) {
  const queryClient = useQueryClient()
  const { openCardDetail } = useUIStore()

  const reminderDate = new Date(card.reminder_at!)
  const isOverdue = isPast(reminderDate) && !card.reminder_done
  const isDueToday = isToday(reminderDate)
  const isDueTomorrow = isTomorrow(reminderDate)

  const doneMutation = useMutation({
    mutationFn: () => cardsApi.update(card.id, { reminder_done: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success('Reminder marked as done')
    },
  })

  const getDateLabel = () => {
    if (card.reminder_done) return 'Done'
    if (isOverdue) return `Overdue · ${formatDistanceToNow(reminderDate, { addSuffix: true })}`
    if (isDueToday) return `Today · ${format(reminderDate, 'h:mm a')}`
    if (isDueTomorrow) return `Tomorrow · ${format(reminderDate, 'h:mm a')}`
    return format(reminderDate, 'MMM d · h:mm a')
  }

  const statusColor = card.reminder_done
    ? 'text-dark-text-muted'
    : isOverdue
    ? 'text-accent-red'
    : isDueToday
    ? 'text-accent-amber'
    : 'text-accent-cyan'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-4 p-4 bg-dark-surface border rounded-2xl transition-all duration-200 hover:border-accent-cyan/30 cursor-pointer group
        ${card.reminder_done ? 'border-dark-border opacity-60' : 'border-dark-border'}`}
    >
      {/* Done button */}
      <button
        onClick={e => { e.stopPropagation(); doneMutation.mutate() }}
        disabled={card.reminder_done || doneMutation.isPending}
        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
          ${card.reminder_done
            ? 'border-dark-text-muted bg-dark-text-muted/20'
            : 'border-dark-border hover:border-accent-cyan hover:bg-accent-cyan/10'}`}
      >
        {card.reminder_done && <Check className="w-4 h-4 text-dark-text-muted" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0" onClick={() => openCardDetail(card.id)}>
        <p className={`font-medium truncate ${card.reminder_done ? 'line-through text-dark-text-muted' : 'text-dark-text-primary'}`}>
          {card.title}
        </p>
        <div className={`flex items-center gap-1.5 mt-0.5 text-xs ${statusColor}`}>
          <Clock className="w-3 h-3" />
          <span>{getDateLabel()}</span>
        </div>
      </div>

      {/* Type badge */}
      <span className="text-xs text-dark-text-muted px-2 py-1 bg-dark-elevated rounded-lg capitalize flex-shrink-0">
        {card.type}
      </span>

      <ChevronRight className="w-4 h-4 text-dark-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </motion.div>
  )
}

export default function RemindersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['cards', { has_reminder: true }],
    queryFn: () => cardsApi.list({ reminder_at__isnull: false, is_archived: false, page_size: 100 }),
  })

  const cards = data?.results || []

  const overdue = cards.filter(c => c.reminder_at && isPast(new Date(c.reminder_at)) && !c.reminder_done)
  const upcoming = cards.filter(c => c.reminder_at && !isPast(new Date(c.reminder_at)) && !c.reminder_done)
  const done = cards.filter(c => c.reminder_done)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-10 w-48 bg-dark-elevated rounded-xl animate-pulse mb-8" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-dark-surface border border-dark-border rounded-2xl animate-pulse mb-3" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-1">Reminders</h1>
        <p className="text-dark-text-muted">
          {upcoming.length > 0
            ? `${upcoming.length} upcoming · ${overdue.length} overdue`
            : overdue.length > 0
            ? `${overdue.length} overdue`
            : 'All caught up!'}
        </p>
      </motion.div>

      {cards.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-dark-elevated flex items-center justify-center mb-6">
            <BellOff className="w-9 h-9 text-dark-text-muted" />
          </div>
          <h3 className="text-xl font-serif font-semibold mb-2">No reminders set</h3>
          <p className="text-dark-text-muted max-w-xs">
            Open any card and set a reminder to revisit it at the right time.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Overdue */}
          {overdue.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-accent-red" />
                <h2 className="text-sm font-semibold text-accent-red uppercase tracking-wider">
                  Overdue ({overdue.length})
                </h2>
              </div>
              <div className="space-y-2">
                {overdue.map(card => <ReminderCard key={card.id} card={card} />)}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                <h2 className="text-sm font-semibold text-accent-cyan uppercase tracking-wider">
                  Upcoming ({upcoming.length})
                </h2>
              </div>
              <div className="space-y-2">
                {upcoming.map(card => <ReminderCard key={card.id} card={card} />)}
              </div>
            </section>
          )}

          {/* Done */}
          {done.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-dark-text-muted" />
                <h2 className="text-sm font-semibold text-dark-text-muted uppercase tracking-wider">
                  Done ({done.length})
                </h2>
              </div>
              <div className="space-y-2">
                {done.map(card => <ReminderCard key={card.id} card={card} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
