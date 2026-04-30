/**
 * Detail Media Router
 * ─────────────────────────────────────────────────────────────────────────────
 * Routes to correct media component by card type
 */
import { Card } from '@/api/cards'
import LinkMedia from './media/LinkMedia'
import YouTubeMedia from './media/YouTubeMedia'
import GitHubMedia from './media/GitHubMedia'
import ImageMedia from './media/ImageMedia'
import VoiceMedia from './media/VoiceMedia'
import NoteMedia from './media/NoteMedia'
import CodeMedia from './media/CodeMedia'
import PDFMedia from './media/PDFMedia'

interface DetailMediaProps {
  card: Card
}

export default function DetailMedia({ card }: DetailMediaProps) {
  switch (card.type) {
    case 'youtube':
      return <YouTubeMedia card={card} />
    case 'github':
      return <GitHubMedia card={card} />
    case 'image':
      return <ImageMedia card={card} />
    case 'voice':
      return <VoiceMedia card={card} />
    case 'note':
      return <NoteMedia card={card} />
    case 'code':
      return <CodeMedia card={card} />
    case 'pdf':
      return <PDFMedia card={card} />
    case 'reel':
      // Reel: similar to link with platform badge
      return <LinkMedia card={card} />
    case 'chat':
      // Chat: display as note with source badge
      return <NoteMedia card={card} />
    case 'file':
      // Generic file: similar to PDF
      return <PDFMedia card={card} />
    case 'link':
    default:
      return <LinkMedia card={card} />
  }
}
