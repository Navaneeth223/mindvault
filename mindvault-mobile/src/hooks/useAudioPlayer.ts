/**
 * useAudioPlayer — expo-av wrapper
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages audio playback state synced with playerStore.
 */
import { useEffect, useRef } from 'react'
import { Audio } from 'expo-av'
import { usePlayerStore } from '@/store/playerStore'

export function useAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null)
  const {
    queue, currentIndex, isPlaying,
    setCurrentTime, setDuration, next,
  } = usePlayerStore()

  const track = queue[currentIndex]

  // Configure audio session on mount
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    }).catch(() => {})
  }, [])

  // Load new track when currentIndex or track changes
  useEffect(() => {
    if (!track?.audioUrl) return

    const load = async () => {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync()
          soundRef.current = null
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: track.audioUrl! },
          { shouldPlay: isPlaying, volume: 1.0 },
          (status) => {
            if (!status.isLoaded) return
            setCurrentTime(status.positionMillis / 1000)
            setDuration((status.durationMillis || 0) / 1000)
            if (status.didJustFinish) next()
          }
        )
        soundRef.current = sound
      } catch (e) {
        console.error('[useAudioPlayer] load error:', e)
      }
    }

    load()

    return () => {
      soundRef.current?.unloadAsync().catch(() => {})
    }
  }, [track?.id])

  // Sync play/pause
  useEffect(() => {
    if (!soundRef.current) return
    if (isPlaying) {
      soundRef.current.playAsync().catch(() => {})
    } else {
      soundRef.current.pauseAsync().catch(() => {})
    }
  }, [isPlaying])

  const seek = async (seconds: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(seconds * 1000)
    }
  }

  return { seek }
}
