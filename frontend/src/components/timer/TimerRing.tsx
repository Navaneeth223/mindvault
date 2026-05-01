/**
 * Timer Ring
 * ─────────────────────────────────────────────────────────────────────────────
 * SVG circular progress ring with animated countdown.
 */
import { TimerPhase } from '@/hooks/useTimer'

interface TimerRingProps {
  timeRemaining: number
  progress: number
  phase: TimerPhase
  size?: number
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const PHASE_LABELS: Record<TimerPhase, string> = {
  focus: 'FOCUS',
  short_break: 'SHORT BREAK',
  long_break: 'LONG BREAK',
}

const PHASE_COLORS: Record<TimerPhase, string> = {
  focus: '#00f5d4',
  short_break: '#f5a623',
  long_break: '#6366f1',
}

export default function TimerRing({ timeRemaining, progress, phase, size = 240 }: TimerRingProps) {
  const radius = (size - 24) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)
  const color = PHASE_COLORS[phase]

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={12}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-serif font-bold tabular-nums"
          style={{ fontSize: size * 0.2, color, lineHeight: 1 }}
        >
          {formatTime(timeRemaining)}
        </span>
        <span className="text-xs font-semibold tracking-widest mt-2" style={{ color: `${color}99` }}>
          {PHASE_LABELS[phase]}
        </span>
      </div>
    </div>
  )
}
