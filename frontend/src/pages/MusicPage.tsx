/**
 * Music Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Music library with now playing, genre filters, and track list.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Music2, Play, MoreVertical, Clock, Search } from 'lucide-react'
import { cardsApi, Card } from '@/api/cards'
import { usePlayerStore, useCurrentTrack } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'
import { formatDistanceToNow } from 'date-fns'

function formatDuration(seconds: number) {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function EqBars() {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="w-1 bg-accent-amber rounded-full"
          animate={{ height: ['40%', '100%', '60%', '80%', '40%'] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function TrackItem({ card, isActive, onPlay }: { card: Card; isActive: boolean; onPlay: () => void }) {
  const duration = card.metadata?.duration
  const artist = card.metadata?.artist || ''
  const coverUrl = card.metadata?.cover_art_url || card.thumbnail_url

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
      onClick={onPlay}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all group
        ${isActive ? 'border-l-2 border-accent-amber bg-accent-amber/5' : ''}`}
    >
      {/* Cover */}
      <div className="w-12 h-12 rounded-lg bg-dark-elevated flex-shrink-0 overflow-hidden">
        {coverUrl ? (
          <img src={coverUrl} alt={card.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music2 className="w-5 h-5 text-accent-amber" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-accent-amber' : 'text-dark-text-primary'}`}>
          {card.title}
        </p>
        <p className="text-xs text-dark-text-muted truncate">
          {artist || card.metadata?.genre || 'Unknown'}
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {isActive ? (
          <EqBars />
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onPlay() }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-accent-amber/10 hover:bg-accent-amber/20 transition-all"
          >
            <Play className="w-3.5 h-3.5 text-accent-amber" />
          </button>
        )}
        <span className="text-xs text-dark-text-muted w-10 text-right">
          {formatDuration(duration)}
        </span>
      </div>
    </motion.div>
  )
}

export default function MusicPage() {
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('')
  const currentTrack = useCurrentTrack()
  const { play, isPlaying } = usePlayerStore()
  const { openCapture } = useUIStore()

  const { data, isLoading } = useQuery({
    queryKey: ['cards-music'],
    queryFn: () => cardsApi.list({ type: 'music', is_archived: false, page_size: 100 }),
  })

  const tracks = data?.results || []

  // Filter
  const filtered = tracks.filter(t => {
    const matchSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.metadata?.artist || '').toLowerCase().includes(search.toLowerCase())
    const matchGenre = !genreFilter || t.metadata?.genre === genreFilter
    return matchSearch && matchGenre
  })

  // Unique genres
  const genres = [...new Set(tracks.map(t => t.metadata?.genre).filter(Boolean))]

  // Stats
  const totalDuration = tracks.reduce((sum, t) => sum + (t.metadata?.duration || 0), 0)
  const totalHours = Math.floor(totalDuration / 3600)
  const totalMins = Math.floor((totalDuration % 3600) / 60)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-1">Music Library</h1>
            {tracks.length > 0 && (
              <p className="text-sm text-dark-text-muted">
                🎵 {tracks.length} songs · ⏱ {totalHours}h {totalMins}m
              </p>
            )}
          </div>
          <button
            onClick={openCapture}
            className="flex items-center gap-2 px-4 py-2 bg-accent-amber text-dark-bg rounded-xl font-medium text-sm hover:bg-accent-amber/90 transition-colors"
          >
            <Music2 className="w-4 h-4" />
            Add Music
          </button>
        </div>
      </motion.div>

      {/* Now Playing */}
      {currentTrack && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-gradient-to-r from-accent-amber/10 to-accent-amber/5 border border-accent-amber/20 rounded-2xl flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
            {currentTrack.metadata?.cover_art_url ? (
              <img src={currentTrack.metadata.cover_art_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-accent-amber/20 flex items-center justify-center">
                <Music2 className="w-6 h-6 text-accent-amber" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-accent-amber font-medium mb-0.5">NOW PLAYING</p>
            <p className="font-semibold text-dark-text-primary truncate">{currentTrack.title}</p>
            <p className="text-sm text-dark-text-muted">{currentTrack.metadata?.artist || ''}</p>
          </div>
          <EqBars />
        </motion.div>
      )}

      {/* Search + Genre filters */}
      <div className="mb-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search songs, artists..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-elevated border border-dark-border rounded-xl text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-amber focus:border-transparent text-sm"
          />
        </div>

        {genres.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setGenreFilter('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${!genreFilter ? 'border-accent-amber bg-accent-amber/10 text-accent-amber' : 'border-dark-border text-dark-text-muted hover:border-dark-text-muted'}`}
            >
              All
            </button>
            {genres.map(g => (
              <button
                key={g}
                onClick={() => setGenreFilter(g === genreFilter ? '' : g!)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${genreFilter === g ? 'border-accent-amber bg-accent-amber/10 text-accent-amber' : 'border-dark-border text-dark-text-muted hover:border-dark-text-muted'}`}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Track list */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-dark-surface border border-dark-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-dark-elevated flex items-center justify-center mb-6">
            <Music2 className="w-9 h-9 text-dark-text-muted" />
          </div>
          <h3 className="text-xl font-serif font-semibold mb-2">
            {search ? 'No results' : 'No music yet'}
          </h3>
          <p className="text-dark-text-muted max-w-xs">
            {search
              ? 'Try different keywords'
              : 'Add music by pasting a YouTube URL or uploading an audio file'}
          </p>
          {!search && (
            <button
              onClick={openCapture}
              className="mt-4 px-4 py-2 bg-accent-amber text-dark-bg rounded-xl text-sm font-medium hover:bg-accent-amber/90 transition-colors"
            >
              Add your first song
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-0.5">
          {filtered.map(track => (
            <TrackItem
              key={track.id}
              card={track}
              isActive={currentTrack?.id === track.id && isPlaying}
              onPlay={() => play(track, filtered)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
