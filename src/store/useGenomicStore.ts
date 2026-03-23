import { create } from 'zustand'
import type { GenomicRecord, GenomicStats, SupportedFormat } from '../types/genomic'

type UploadStatus = 'idle' | 'parsing' | 'done' | 'error'

interface GenomicStore {
  status: UploadStatus
  fileName: string | null
  format: SupportedFormat | null
  error: string | null
  warnings: string[]
  records: GenomicRecord[]
  stats: GenomicStats | null

  startParsing: (fileName: string, format: SupportedFormat) => void
  setParsed: (records: GenomicRecord[], stats: GenomicStats, warnings: string[]) => void
  setError: (error: string, warnings?: string[]) => void
  reset: () => void
}

const initialState = {
  status: 'idle' as UploadStatus,
  fileName: null,
  format: null,
  error: null,
  warnings: [],
  records: [],
  stats: null,
}

export const useGenomicStore = create<GenomicStore>((set) => ({
  ...initialState,

  startParsing: (fileName, format) =>
    set({ status: 'parsing', fileName, format, error: null, warnings: [], records: [], stats: null }),

  setParsed: (records, stats, warnings) =>
    set({ status: 'done', records, stats, warnings }),

  setError: (error, warnings = []) =>
    set({ status: 'error', error, warnings }),

  reset: () => set(initialState),
}))
