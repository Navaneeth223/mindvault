/**
 * File Capture Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Drag & drop file upload
 */
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, Image as ImageIcon, FileText, Music } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface FileCaptureProps {
  onSave: (data: { file: File; title: string }) => void
  onCancel: () => void
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return ImageIcon
  if (type.startsWith('audio/')) return Music
  if (type.includes('pdf')) return FileText
  return File
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileCapture({ onSave, onCancel }: FileCaptureProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`)
      } else {
        setError('Invalid file type or size')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)
      // Auto-generate title from filename
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        setTitle(nameWithoutExt)
      }
    }
  }, [title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
      'application/pdf': ['.pdf'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'application/zip': ['.zip'],
      'text/*': ['.txt', '.md', '.csv'],
    },
  })

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setError(null)
  }

  const handleSave = () => {
    if (!selectedFile) return
    onSave({
      file: selectedFile,
      title: title.trim() || selectedFile.name,
    })
  }

  const canSave = selectedFile !== null

  const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : Upload

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div>
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
          File
        </label>
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer ${
            isDragActive
              ? 'border-accent-cyan bg-accent-cyan/5'
              : selectedFile
              ? 'border-dark-border bg-dark-elevated'
              : 'border-dark-border bg-dark-elevated hover:border-accent-cyan/50 hover:bg-accent-cyan/5'
          }`}
        >
          <input {...getInputProps()} />

          <AnimatePresence mode="wait">
            {!selectedFile ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent-cyan/10 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-accent-cyan" />
                </div>
                <p className="text-dark-text-primary font-medium mb-1">
                  {isDragActive ? 'Drop file here' : 'Drop file or click to browse'}
                </p>
                <p className="text-sm text-dark-text-muted">
                  Images, PDFs, audio, video, documents (max {formatFileSize(MAX_FILE_SIZE)})
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-4"
              >
                {/* Preview */}
                {selectedFile.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt={selectedFile.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-8 h-8 text-accent-cyan" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark-text-primary truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-dark-text-muted">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFile()
                  }}
                  className="p-2 rounded-xl hover:bg-dark-hover transition-colors"
                >
                  <X className="w-5 h-5 text-dark-text-muted" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-accent-red"
          >
            {error}
          </motion.p>
        )}
      </div>

      {/* Title */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="block text-sm font-medium text-dark-text-secondary mb-2">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="File title..."
          />
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!canSave} className="flex-1">
          Upload File
        </Button>
      </div>
    </div>
  )
}
