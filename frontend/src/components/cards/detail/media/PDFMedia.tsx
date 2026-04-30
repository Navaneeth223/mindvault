/**
 * PDF Media
 * ─────────────────────────────────────────────────────────────────────────────
 * PDF viewer with iframe
 */
import { FileText, Download, ExternalLink } from 'lucide-react'
import { Card } from '@/api/cards'

interface PDFMediaProps {
  card: Card
}

export default function PDFMedia({ card }: PDFMediaProps) {
  const pdfUrl = card.file_url

  if (!pdfUrl) {
    return (
      <div className="aspect-video bg-dark-elevated flex items-center justify-center">
        <p className="text-sm text-dark-text-muted">No PDF available</p>
      </div>
    )
  }

  const filename = card.metadata?.filename || 'document.pdf'

  return (
    <div className="bg-dark-elevated">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-amber/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-accent-amber" />
          </div>
          <div>
            <p className="text-sm font-medium text-dark-text-primary">{filename}</p>
            {card.metadata?.file_size && (
              <p className="text-xs text-dark-text-muted">
                {(card.metadata.file_size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={pdfUrl}
            download={filename}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-dark-text-secondary hover:bg-dark-hover rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-dark-text-secondary hover:bg-dark-hover rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open
          </a>
        </div>
      </div>

      {/* PDF iframe */}
      <div className="relative">
        <iframe
          src={`${pdfUrl}#toolbar=0`}
          title={filename}
          className="w-full h-[500px] bg-dark-surface"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const fallback = e.currentTarget.nextElementSibling
            if (fallback) {
              (fallback as HTMLElement).style.display = 'flex'
            }
          }}
        />

        {/* Fallback if iframe blocked */}
        <div className="hidden w-full h-[500px] bg-dark-surface items-center justify-center flex-col gap-4">
          <FileText className="w-12 h-12 text-dark-text-muted" />
          <p className="text-sm text-dark-text-muted">
            PDF preview not available in this browser
          </p>
          <a
            href={pdfUrl}
            download={filename}
            className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-dark-bg rounded-lg hover:bg-accent-cyan/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        </div>
      </div>
    </div>
  )
}
