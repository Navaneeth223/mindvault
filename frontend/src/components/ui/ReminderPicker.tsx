/**
 * Reminder Picker Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Date/time picker with quick options
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'
import { format, addHours, addDays, setHours, setMinutes, startOfDay, nextMonday } from 'date-fns'

interface ReminderPickerProps {
  value: string | null
  onChange: (datetime: string | null) => void
}

export default function ReminderPicker({ value, onChange }: ReminderPickerProps) {
  const [enabled, setEnabled] = useState(!!value)
  const [showCustom, setShowCustom] = useState(false)

  // Quick options
  const quickOptions = [
    {
      label: 'Today 6PM',
      getValue: () => {
        const date = setMinutes(setHours(new Date(), 18), 0)
        return date.toISOString()
      },
    },
    {
      label: 'Tomorrow 9AM',
      getValue: () => {
        const date = setMinutes(setHours(addDays(new Date(), 1), 9), 0)
        return date.toISOString()
      },
    },
    {
      label: 'Next Monday',
      getValue: () => {
        const date = setMinutes(setHours(nextMonday(new Date()), 9), 0)
        return date.toISOString()
      },
    },
  ]

  // Handle toggle
  const handleToggle = () => {
    if (enabled) {
      setEnabled(false)
      onChange(null)
      setShowCustom(false)
    } else {
      setEnabled(true)
      // Set default to tomorrow 9AM
      const defaultDate = setMinutes(setHours(addDays(new Date(), 1), 9), 0)
      onChange(defaultDate.toISOString())
    }
  }

  // Handle quick option
  const handleQuickOption = (getValue: () => string) => {
    const datetime = getValue()
    onChange(datetime)
    setShowCustom(false)
  }

  // Handle custom datetime
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const datetime = new Date(e.target.value).toISOString()
    onChange(datetime)
  }

  // Format relative time
  const getRelativeTime = (datetime: string) => {
    const date = new Date(datetime)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffDays > 1) return `in ${diffDays} days`
    if (diffDays === 1) return 'tomorrow'
    if (diffHours > 0) return `in ${diffHours} hours`
    return 'soon'
  }

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-dark-text-secondary">
          <Clock className="w-4 h-4" />
          Reminder
        </label>
        <button
          type="button"
          onClick={handleToggle}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            enabled ? 'bg-accent-cyan' : 'bg-dark-border'
          }`}
        >
          <motion.div
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
            animate={{ x: enabled ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Options */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Quick options */}
            <div className="flex flex-wrap gap-2">
              {quickOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleQuickOption(option.getValue)}
                  className="px-3 py-1.5 text-sm bg-dark-elevated border border-dark-border rounded-lg hover:border-accent-cyan/50 hover:bg-accent-cyan/5 transition-colors"
                >
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowCustom(!showCustom)}
                className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                  showCustom
                    ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan'
                    : 'bg-dark-elevated border-dark-border hover:border-accent-cyan/50'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom datetime picker */}
            {showCustom && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <input
                  type="datetime-local"
                  value={value ? format(new Date(value), "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={handleCustomChange}
                  className="w-full px-4 py-2.5 bg-dark-elevated border border-dark-border rounded-xl text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                />
              </motion.div>
            )}

            {/* Current reminder */}
            {value && (
              <p className="text-xs text-dark-text-muted">
                Reminder {getRelativeTime(value)} • {format(new Date(value), 'MMM d, h:mm a')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
