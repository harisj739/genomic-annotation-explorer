import { useState } from 'react'
import type { SupportedFormat } from '../../types/genomic'
import { formatNumber } from '../../utils/formatting'
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
  featureCount: number
}

export function FileFormatBadge({ format, fileName, featureCount }: FileFormatBadgeProps) {
  const [open, setOpen] = useState(false)
  const savedFiles = useGenomicStore((s) => s.savedFiles)
  const hasSaved = savedFiles.length > 0

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${FORMAT_COLORS[format]}`}>
        {format}
      </span>

      {/* Clickable filename */}
      <div className="relative">
        <button
          onClick={() => hasSaved && setOpen((o) => !o)}
          title={hasSaved ? 'Switch file' : fileName}
          className={`text-sm font-medium truncate max-w-xs transition-all ${
            hasSaved
              ? 'text-gray-700 cursor-pointer hover:text-purple-600 hover:drop-shadow-[0_0_6px_rgba(147,51,234,0.5)]'
              : 'text-gray-600 cursor-default'
          }`}
        >
          {fileName}
          {hasSaved && (
            <svg
              className="inline-block ml-1 w-3 h-3 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
        {open && <SavedFilesMenu onClose={() => setOpen(false)} className="top-full left-0" />}
      </div>

      <span className="text-sm text-gray-500">
        {formatNumber(featureCount)} features
      </span>
    </div>
  )
}
