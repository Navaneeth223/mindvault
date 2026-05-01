/**
 * Mini Player — Mobile
 * ─────────────────────────────────────────────────────────────────────────────
 * Persistent bottom player bar using expo-av.
 */
import React, { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Audio } from 'expo-av'
import { usePlayerStore } from '@/store/playerStore'

export default function MiniPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null)
  const { queue, currentIndex, isPlaying, pause, resume, next, prev, setCurrentTime, setDuration } = usePlayerStore()
  const track = queue[currentIndex]

  useEffect(() => {
    if (!track?.audioUrl) return

    const loadAndPlay = async () => {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync()
        }
        const { sound } = await Audio.Sound.createAsync(
          { uri: track.audioUrl! },
          { shouldPlay: isPlaying },
          (status) => {
            if (status.isLoaded) {
              setCurrentTime(status.positionMillis / 1000)
              setDuration((status.durationMillis || 0) / 1000)
              if (status.didJustFinish) next()
            }
          }
        )
        soundRef.current = sound
      } catch (e) {
        console.error('Audio load error:', e)
      }
    }

    loadAndPlay()
    return () => { soundRef.current?.unloadAsync() }
  }, [track?.id])

  useEffect(() => {
    if (!soundRef.current) return
    if (isPlaying) soundRef.current.playAsync().catch(() => {})
    else soundRef.current.pauseAsync().catch(() => {})
  }, [isPlaying])

  if (!track) return null

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
        {track.artist && <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>}
      </View>
      <View style={styles.controls}>
        <TouchableOpacity onPress={prev} style={styles.btn}>
          <Text style={styles.btnText}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={isPlaying ? pause : resume} style={styles.playBtn}>
          <Text style={styles.playBtnText}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={next} style={styles.btn}>
          <Text style={styles.btnText}>⏭</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#1e1e35', borderTopWidth: 1, borderTopColor: 'rgba(245,166,35,0.2)',
  },
  info: { flex: 1, marginRight: 12 },
  title: { fontSize: 13, fontWeight: '600', color: '#e8e8f0' },
  artist: { fontSize: 11, color: '#6b6b8a', marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: { padding: 6 },
  btnText: { fontSize: 18, color: '#6b6b8a' },
  playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f5a623', alignItems: 'center', justifyContent: 'center' },
  playBtnText: { fontSize: 16, color: '#1a1a2e' },
})
