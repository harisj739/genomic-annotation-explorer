import { describe, it, expect } from 'vitest'
import { parseBed } from './bed'

const BED3 = `chr1\t0\t100
chr2\t500\t1000
chrX\t200\t300`

const BED6 = `chr1\t0\t100\texon1\t500\t+
chr2\t500\t1000\tgene2\t.\t-
chrX\t200\t300\t.\t.\t.`

const BED_WITH_HEADERS = `track name="test" description="test"
browser position chr1:1-1000
# comment line
chr1\t0\t100
chr2\t500\t1000`

const BED_INVALID = `track name="test"
browser position`

describe('parseBed', () => {
  it('parses BED3 correctly', () => {
    const result = parseBed(BED3)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data).toHaveLength(3)
    expect(result.data[0]).toMatchObject({
      chrom: 'chr1', start: 0, end: 100, featureType: 'region', strand: '.', score: null, source: 'BED',
    })
    expect(result.data[1]).toMatchObject({ chrom: 'chr2', start: 500, end: 1000 })
  })

  it('parses BED6 with name, score, strand', () => {
    const result = parseBed(BED6)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data[0].attributes['name']).toBe('exon1')
    expect(result.data[0].score).toBe(500)
    expect(result.data[0].strand).toBe('+')
    expect(result.data[1].score).toBeNull()
    expect(result.data[1].strand).toBe('-')
    expect(result.data[2].strand).toBe('.')
  })

  it('skips track, browser, and comment lines', () => {
    const result = parseBed(BED_WITH_HEADERS)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data).toHaveLength(2)
  })

  it('returns error for file with no valid records', () => {
    const result = parseBed(BED_INVALID)
    expect(result.ok).toBe(false)
  })

  it('returns error for empty file', () => {
    const result = parseBed('')
    expect(result.ok).toBe(false)
  })

  it('preserves rawLine', () => {
    const result = parseBed(BED3)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data[0].rawLine).toBe('chr1\t0\t100')
  })

  it('warns on lines with fewer than 3 columns', () => {
    const result = parseBed('chr1\t0')
    expect(result.warnings.length).toBeGreaterThan(0)
  })
})
