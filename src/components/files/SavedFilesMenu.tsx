import { useEffect, useRef } from 'react'
import { useGenomicStore } from '../../store/useGenomicStore'
import { formatNumber } from '../../utils/formatting'

const FORMAT_COLORS: Record<string, string> = {
  BED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  GTF: 'bg-blue-100 text-blue-800 border-blue-200',
  GFF2: 'bg-purple-100 text-purple-800 border-purple-200',
  GFF3: 'bg-violet-100 text-violet-800 border-violet-200',
}

interface SavedFilesMenuProps {
  onClose: () => void
  /** Additional class for positioning the dropdown */
  className?: string
}

export function SavedFilesMenu({ onClose, className = '' }: SavedFilesMenuProps) {
  const { savedFiles, loadSavedFile, fileName: activeFileName } = useGenomicStore()
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (savedFiles.length === 0) return null

  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden ${className}`}
    >
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Saved Files</p>
      </div>
      <ul className="max-h-72 overflow-y-auto">
        {savedFiles.map((file) => {
          const isActive = file.fileName === activeFileName
          return (
            <li key={file.id}>
              <button
                onClick={() => { loadSavedFile(file.id); onClose() }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-indigo-50 transition-colors cursor-pointer ${isActive ? 'bg-indigo-50' : ''}`}
              >
                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${FORMAT_COLORS[file.format] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {file.format}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-indigo-700' : 'text-gray-800'}`}>
                    {file.fileName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatNumber(file.stats.totalFeatures)} features
                  </p>
                </div>
                {isActive && (
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
