/**
 * Waveform Visualiser
 * ─────────────────────────────────────────────────────────────────────────────
 * Animated waveform bars for voice recording
 */
import { motion } from 'framer-motion'

interface WaveformVisualiserProps {
  data: number[]
  isRecording: boolean
  height?: number
  className?: string
}

export default function WaveformVisualiser({
  data,
  isRecording,
  height = 64,
  className = '',
}: WaveformVisualiserProps) {
  const barCount = data.length
  const maxHeight = height
  const minHeight = 3

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`} style={{ height }}>
      {data.map((amplitude, index) => {
        const barHeight = Math.max(minHeight, amplitude * maxHeight)

        return (
          <motion.div
            key={index}
            className="rounded-full"
            style={{
              width: `${100 / barCount - 0.5}%`,
              maxWidth: '4px',
              backgroundColor: isRecording ? '#00f5d4' : '#6b6b8a',
              opacity: isRecording ? 0.8 + amplitude * 0.2 : 0.4,
            }}
            animate={{
              height: barHeight,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
          />
        )
      })}
    </div>
  )
}

// Idle waveform (when not recording)
export function IdleWaveform({ height = 64, className = '' }: { height?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`} style={{ height }}>
      {Array.from({ length: 40 }).map((_, index) => (
        <motion.div
          key={index}
          className="rounded-full bg-dark-text-muted/30"
          style={{
            width: '2px',
            height: '2px',
          }}
          animate={{
            height: [2, 4, 2],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.05,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
