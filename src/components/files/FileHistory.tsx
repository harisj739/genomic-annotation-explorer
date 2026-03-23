import { useState } from 'react'
import { useGenomicStore } from '../../store/useGenomicStore'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { formatNumber } from '../../utils/formatting'
import type { SavedFile } from '../../types/genomic'

const FORMAT_COLORS: Record<string, string> = {
  BED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  GTF: 'bg-blue-100 text-blue-800 border-blue-200',
  GFF2: 'bg-purple-100 text-purple-800 border-purple-200',
  GFF3: 'bg-violet-100 text-violet-800 border-violet-200',
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface FileHistoryProps {
  /** When true the panel starts expanded */
  defaultOpen?: boolean
}

export function FileHistory({ defaultOpen = true }: FileHistoryProps) {
  const { savedFiles, loadSavedFile, deleteSavedFile } = useGenomicStore()
  const [open, setOpen] = useState(defaultOpen)
  const [fileToDelete, setFileToDelete] = useState<SavedFile | null>(null)

  if (savedFiles.length === 0) return null

  return (
    <>
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Header */}
        <button
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors rounded-xl cursor-pointer"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">Saved Files</span>
            <span className="text-xs font-medium bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
              {savedFiles.length}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* File list */}
        {open && (
          <ul className="divide-y divide-gray-100 border-t border-gray-100">
            {savedFiles.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
              >
                {/* Format badge */}
                <span
                  className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${FORMAT_COLORS[file.format] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}
                >
                  {file.format}
                </span>

                {/* File info — clicking loads the file */}
                <button
                  className="flex-1 min-w-0 text-left cursor-pointer"
                  onClick={() => loadSavedFile(file.id)}
                  title={`Load ${file.fileName}`}
                >
                  <p className="text-sm font-medium text-gray-800 truncate">{file.fileName}</p>
                  <p className="text-xs text-gray-400">
                    {formatNumber(file.stats.totalFeatures)} features · {formatDate(file.savedAt)}
                  </p>
                </button>

                {/* Delete button */}
                <button
                  className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  onClick={() => setFileToDelete(file)}
                  aria-label={`Delete ${file.fileName}`}
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {fileToDelete && (
        <DeleteConfirmDialog
          fileName={fileToDelete.fileName}
          onConfirm={() => {
            deleteSavedFile(fileToDelete.id)
            setFileToDelete(null)
          }}
          onCancel={() => setFileToDelete(null)}
        />
      )}
    </>
  )
}
