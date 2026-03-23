import { useState } from 'react'
import type { SupportedFormat } from '../../types/genomic'
import { SavedFilesMenu } from '../files/SavedFilesMenu'
import { useGenomicStore } from '../../store/useGenomicStore'

const FORMAT_COLORS: Record<SupportedFormat, string> = {
  BED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  GTF: 'bg-blue-100 text-blue-800 border-blue-200',
  GFF2: 'bg-purple-100 text-purple-800 border-purple-200',
  GFF3: 'bg-violet-100 text-violet-800 border-violet-200',
}

interface FileFormatBadgeProps {
  format: SupportedFormat
  fileName: string
}

export function FileFormatBadge({ format, fileName }: FileFormatBadgeProps) {
  const [open, setOpen] = useState(false)
  const savedFiles = useGenomicStore((s) => s.savedFiles)
  const hasSaved = savedFiles.length > 0

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={`text-sm font-bold px-3.5 py-1.5 rounded-full border-2 ${FORMAT_COLORS[format]}`}>
        {format}
      </span>

      {/* Clickable filename */}
      <div className="relative">
        <button
          onClick={() => hasSaved && setOpen((o) => !o)}
          title={hasSaved ? 'Switch file' : fileName}
          className={`text-base font-semibold truncate max-w-sm transition-all ${
            hasSaved
              ? 'text-white cursor-pointer hover:text-purple-100 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
              : 'text-white cursor-default'
          }`}
        >
          {fileName}
          {hasSaved && (
            <svg
              className="inline-block ml-1.5 w-3.5 h-3.5 text-white/70"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
        {open && <SavedFilesMenu onClose={() => setOpen(false)} className="top-full left-0" />}
      </div>
    </div>
  )
}
