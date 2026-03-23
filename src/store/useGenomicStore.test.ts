import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGenomicStore } from './useGenomicStore'
import type { GenomicRecord, GenomicStats } from '../types/genomic'

// ── localStorage mock ────────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

// ── Helpers ──────────────────────────────────────────────────────────────────

const makeRecord = (overrides: Partial<GenomicRecord> = {}): GenomicRecord => ({
  chrom: 'chr1', start: 0, end: 100, featureType: 'exon', strand: '+',
  score: null, source: 'test', attributes: {}, rawLine: '',
  ...overrides,
})

const makeStats = (overrides: Partial<GenomicStats> = {}): GenomicStats => ({
  totalFeatures: 4,
  uniqueChromosomes: ['chr1'],
  featureTypeCounts: { exon: 4 },
  strandCounts: { plus: 4, minus: 0, unknown: 0 },
  chromosomeCounts: { chr1: 4 },
  lengthDistribution: [100, 100, 100, 100],
  coverageByChrom: { chr1: 400 },
  meanFeatureLength: 100,
  medianFeatureLength: 100,
  format: 'BED',
  ...overrides,
})

// ── Reset store state before every test ─────────────────────────────────────

beforeEach(() => {
  localStorageMock.clear()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()

  // Reset the store to a clean slate
  useGenomicStore.setState({
    status: 'idle',
    fileName: null,
    format: null,
    error: null,
    warnings: [],
    records: [],
    stats: null,
    savedFiles: [],
  })
})

// ── Tests ────────────────────────────────────────────────────────────────────

describe('startParsing', () => {
  it('sets status to parsing and clears previous state', () => {
    useGenomicStore.setState({ status: 'done', error: 'old error' })
    useGenomicStore.getState().startParsing('file.bed', 'BED')
    const s = useGenomicStore.getState()
    expect(s.status).toBe('parsing')
    expect(s.fileName).toBe('file.bed')
    expect(s.format).toBe('BED')
    expect(s.error).toBeNull()
    expect(s.records).toEqual([])
    expect(s.stats).toBeNull()
  })
})

describe('setParsed', () => {
  it('sets status to done with records and stats', () => {
    useGenomicStore.setState({ fileName: 'test.bed', format: 'BED' })
    const records = [makeRecord()]
    const stats = makeStats()
    useGenomicStore.getState().setParsed(records, stats, [])
    const s = useGenomicStore.getState()
    expect(s.status).toBe('done')
    expect(s.records).toBe(records)
    expect(s.stats).toBe(stats)
  })

  it('auto-saves the file to savedFiles', () => {
    useGenomicStore.setState({ fileName: 'annotations.gtf', format: 'GTF' })
    const stats = makeStats({ format: 'GTF' })
    useGenomicStore.getState().setParsed([makeRecord()], stats, ['warn1'])
    const { savedFiles } = useGenomicStore.getState()
    expect(savedFiles).toHaveLength(1)
    expect(savedFiles[0].fileName).toBe('annotations.gtf')
    expect(savedFiles[0].format).toBe('GTF')
    expect(savedFiles[0].warnings).toEqual(['warn1'])
    expect(typeof savedFiles[0].id).toBe('string')
    expect(savedFiles[0].savedAt).toBeGreaterThan(0)
  })

  it('persists saved files to localStorage', () => {
    useGenomicStore.setState({ fileName: 'a.bed', format: 'BED' })
    useGenomicStore.getState().setParsed([makeRecord()], makeStats(), [])
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'genomic-explorer-saved-files',
      expect.stringContaining('a.bed')
    )
  })

  it('prepends new files so the newest is first', () => {
    useGenomicStore.setState({ fileName: 'first.bed', format: 'BED' })
    useGenomicStore.getState().setParsed([makeRecord()], makeStats(), [])
    useGenomicStore.setState({ fileName: 'second.gtf', format: 'GTF' })
    useGenomicStore.getState().setParsed([makeRecord()], makeStats({ format: 'GTF' }), [])
    const { savedFiles } = useGenomicStore.getState()
    expect(savedFiles[0].fileName).toBe('second.gtf')
    expect(savedFiles[1].fileName).toBe('first.bed')
  })

  it('caps savedFiles at 20 entries', () => {
    for (let i = 0; i < 22; i++) {
      useGenomicStore.setState({ fileName: `file${i}.bed`, format: 'BED' })
      useGenomicStore.getState().setParsed([makeRecord()], makeStats(), [])
    }
    expect(useGenomicStore.getState().savedFiles).toHaveLength(20)
  })
})

describe('setError', () => {
  it('sets status to error with message and optional warnings', () => {
    useGenomicStore.getState().setError('Parse failed', ['line 3 invalid'])
    const s = useGenomicStore.getState()
    expect(s.status).toBe('error')
    expect(s.error).toBe('Parse failed')
    expect(s.warnings).toEqual(['line 3 invalid'])
  })

  it('defaults warnings to empty array', () => {
    useGenomicStore.getState().setError('oops')
    expect(useGenomicStore.getState().warnings).toEqual([])
  })
})

describe('reset', () => {
  it('clears active file state but preserves savedFiles', () => {
    useGenomicStore.setState({ fileName: 'a.bed', format: 'BED' })
    useGenomicStore.getState().setParsed([makeRecord()], makeStats(), [])
    useGenomicStore.getState().reset()
    const s = useGenomicStore.getState()
    expect(s.status).toBe('idle')
    expect(s.fileName).toBeNull()
    expect(s.stats).toBeNull()
    expect(s.records).toEqual([])
    expect(s.savedFiles).toHaveLength(1) // preserved
  })
})

describe('loadSavedFile', () => {
  it('restores stats and metadata from a saved file', () => {
    useGenomicStore.setState({ fileName: 'genes.gff', format: 'GFF3' })
    const stats = makeStats({ format: 'GFF3', totalFeatures: 99 })
    useGenomicStore.getState().setParsed([makeRecord()], stats, ['w1'])
    const { savedFiles } = useGenomicStore.getState()
    const id = savedFiles[0].id

    useGenomicStore.getState().reset()
    useGenomicStore.getState().loadSavedFile(id)

    const s = useGenomicStore.getState()
    expect(s.status).toBe('done')
    expect(s.fileName).toBe('genes.gff')
    expect(s.format).toBe('GFF3')
    expect(s.stats?.totalFeatures).toBe(99)
    expect(s.warnings).toEqual(['w1'])
  })

  it('does nothing for an unknown id', () => {
    useGenomicStore.getState().loadSavedFile('nonexistent-id')
    expect(useGenomicStore.getState().status).toBe('idle')
  })
})

describe('deleteSavedFile', () => {
  it('removes the file from savedFiles', () => {
    useGenomicStore.setState({ fileName: 'a.bed', format: 'BED' })
    useGenomicStore.getState().setParsed([makeRecord()], makeStats(), [])
    const id = useGenomicStore.getState().savedFiles[0].id

    useGenomicStore.getState().deleteSavedFile(id)
    expect(useGenomicStore.getState().savedFiles).toHaveLength(0)
  })

  it('persists deletion to localStorage', () => {
    useGenomicStore.setState({ fileName: 'a.bed', format: 'BED' })
    useGenomicStore.getState().setParsed([makeRecord()], makeStats(), [])
    const id = useGenomicStore.getState().savedFiles[0].id
    localStorageMock.setItem.mockClear()

    useGenomicStore.getState().deleteSavedFile(id)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'genomic-explorer-saved-files',
      expect.stringMatching(/^\[/)  // valid JSON array
    )
  })

  it('does not affect other saved files', () => {
    useGenomicStore.setState({ fileName: 'a.bed', format: 'BED' })
    useGenomicStore.getState().setParsed([makeRecord()], makeStats(), [])
    useGenomicStore.setState({ fileName: 'b.gtf', format: 'GTF' })
    useGenomicStore.getState().setParsed([makeRecord()], makeStats({ format: 'GTF' }), [])

    const idToDelete = useGenomicStore.getState().savedFiles.find(f => f.fileName === 'a.bed')!.id
    useGenomicStore.getState().deleteSavedFile(idToDelete)

    const { savedFiles } = useGenomicStore.getState()
    expect(savedFiles).toHaveLength(1)
    expect(savedFiles[0].fileName).toBe('b.gtf')
  })
})
