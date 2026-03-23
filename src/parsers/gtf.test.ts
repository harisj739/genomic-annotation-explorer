import { describe, it, expect } from 'vitest'
import { parseGtf } from './gtf'

const GTF_SAMPLE = `# GTF file
chr1\tHAVANA\tgene\t11869\t14409\t.\t+\t.\tgene_id "ENSG00000223972"; gene_name "DDX11L1";
chr1\tHAVANA\texon\t11869\t12227\t.\t+\t.\tgene_id "ENSG00000223972"; transcript_id "ENST00000456328";
chr1\tENSEMBL\tCDS\t65565\t65573\t.\t-\t0\tgene_id "ENSG00000186092";`

describe('parseGtf', () => {
  it('parses basic GTF records', () => {
    const result = parseGtf(GTF_SAMPLE)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data).toHaveLength(3)
  })

  it('converts 1-based closed to 0-based half-open', () => {
    const result = parseGtf(GTF_SAMPLE)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    // GTF line: start=11869, end=14409 → 0-based: start=11868, end=14409
    expect(result.data[0].start).toBe(11868)
    expect(result.data[0].end).toBe(14409)
  })

  it('parses feature types correctly', () => {
    const result = parseGtf(GTF_SAMPLE)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data[0].featureType).toBe('gene')
    expect(result.data[1].featureType).toBe('exon')
    expect(result.data[2].featureType).toBe('CDS')
  })

  it('parses strand correctly', () => {
    const result = parseGtf(GTF_SAMPLE)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data[0].strand).toBe('+')
    expect(result.data[2].strand).toBe('-')
  })

  it('parses attributes into key-value map', () => {
    const result = parseGtf(GTF_SAMPLE)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data[0].attributes['gene_id']).toBe('ENSG00000223972')
    expect(result.data[0].attributes['gene_name']).toBe('DDX11L1')
    expect(result.data[1].attributes['transcript_id']).toBe('ENST00000456328')
  })

  it('parses source column', () => {
    const result = parseGtf(GTF_SAMPLE)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data[0].source).toBe('HAVANA')
    expect(result.data[2].source).toBe('ENSEMBL')
  })

  it('stores frame in attributes', () => {
    const result = parseGtf(GTF_SAMPLE)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data[2].attributes['frame']).toBe('0')
  })

  it('skips comment lines', () => {
    const result = parseGtf('# just a comment\n')
    expect(result.ok).toBe(false)
  })
})
