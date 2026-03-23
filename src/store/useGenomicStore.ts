import { create } from 'zustand'
import type { GenomicRecord, GenomicStats, SupportedFormat, SavedFile } from '../types/genomic'

type UploadStatus = 'idle' | 'parsing' | 'done' | 'error'

const STORAGE_KEY = 'genomic-explorer-saved-files'
const MAX_SAVED_FILES = 20

function loadFromStorage(): SavedFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedFile[]) : []
  } catch {
    return []
  }
}

function persist(files: SavedFile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

interface GenomicStore {
  status: UploadStatus
  fileName: string | null
  format: SupportedFormat | null
  error: string | null
  warnings: string[]
  records: GenomicRecord[]
  stats: GenomicStats | null
  savedFiles: SavedFile[]

  startParsing: (fileName: string, format: SupportedFormat) => void
  setParsed: (records: GenomicRecord[], stats: GenomicStats, warnings: string[]) => void
  setError: (error: string, warnings?: string[]) => void
  reset: () => void
  loadSavedFile: (id: string) => void
  deleteSavedFile: (id: string) => void
}

const baseInitialState = {
  status: 'idle' as UploadStatus,
  fileName: null,
  format: null,
  error: null,
  warnings: [],
  records: [],
  stats: null,
}

export const useGenomicStore = create<GenomicStore>((set, get) => ({
  ...baseInitialState,
  savedFiles: loadFromStorage(),

  startParsing: (fileName, format) =>
    set({ status: 'parsing', fileName, format, error: null, warnings: [], records: [], stats: null }),

  setParsed: (records, stats, warnings) =>
    set((state) => {
      const newEntry: SavedFile = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fileName: state.fileName!,
        format: state.format!,
        savedAt: Date.now(),
        stats,
        warnings,
      }
      const savedFiles = [newEntry, ...state.savedFiles].slice(0, MAX_SAVED_FILES)
      persist(savedFiles)
      return { status: 'done', records, stats, warnings, savedFiles }
    }),

  setError: (error, warnings = []) =>
    set({ status: 'error', error, warnings }),

  reset: () => set({ ...baseInitialState, savedFiles: get().savedFiles }),

  loadSavedFile: (id) => {
    const file = get().savedFiles.find((f) => f.id === id)
    if (!file) return
    set({
      status: 'done',
      fileName: file.fileName,
      format: file.format,
      stats: file.stats,
      warnings: file.warnings,
      records: [],
      error: null,
    })
  },

  deleteSavedFile: (id) =>
    set((state) => {
      const savedFiles = state.savedFiles.filter((f) => f.id !== id)
      persist(savedFiles)
      return { savedFiles }
    }),
}))
