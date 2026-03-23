import { describe, it, expect } from 'vitest'
import { parseGff } from './gff'

const GFF3_SAMPLE = `##gff-version 3
chr1\tEnsembl\tgene\t11869\t14409\t.\t+\t.\tID=gene1;Name=DDX11L1;biotype=transcribed_unprocessed_pseudogene
chr1\tEnsembl\texon\t11869\t12227\t.\t+\t.\tID=exon1;Parent=transcript1;
chr1\tEnsembl\tCDS\t65565\t65573\t.\t-\t0\tID=cds1;Parent=transcript2`

const GFF2_SAMPLE = `chr1\tEnsembl\tgene\t11869\t14409\t.\t+\t.\tgene_id "ENSG1"; gene_name "DDX11L1";
chr1\tEnsembl\texon\t11869\t12227\t.\t+\t.\tgene_id "ENSG1"; transcript_id "ENST1";`

const GFF3_URL_ENCODED = `##gff-version 3
chr1\ttest\tgene\t1\t100\t.\t+\t.\tID=gene%201;Name=test%20gene`

describe('parseGff - GFF3', () => {
  it('parses GFF3 records', () => {
    const result = parseGff(GFF3_SAMPLE, 'GFF3')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data).toHaveLength(3)
  })

  it('converts 1-based to 0-based', () => {
    const result = parseGff(GFF3_SAMPLE, 'GFF3')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data[0].start).toBe(11868)
    expect(result.data[0].end).toBe(14409)
  })

  it('parses GFF3 key=value attributes', () => {
    const result = parseGff(GFF3_SAMPLE, 'GFF3')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data[0].attributes['ID']).toBe('gene1')
    expect(result.data[0].attributes['Name']).toBe('DDX11L1')
    expect(result.data[1].attributes['Parent']).toBe('transcript1')
  })

  it('URL-decodes GFF3 attribute values', () => {
    const result = parseGff(GFF3_URL_ENCODED, 'GFF3')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data[0].attributes['ID']).toBe('gene 1')
    expect(result.data[0].attributes['Name']).toBe('test gene')
  })

  it('auto-detects GFF3 from ##gff-version header', () => {
    // Even if hint says GFF2, the header overrides
    const result = parseGff(GFF3_SAMPLE, 'GFF2')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    // GFF3 attribute style parsed correctly
    expect(result.data[0].attributes['ID']).toBe('gene1')
  })
})

describe('parseGff - GFF2', () => {
  it('parses GFF2 records', () => {
    const result = parseGff(GFF2_SAMPLE, 'GFF2')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data).toHaveLength(2)
  })

  it('parses GFF2 quoted key-value attributes', () => {
    const result = parseGff(GFF2_SAMPLE, 'GFF2')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data[0].attributes['gene_id']).toBe('ENSG1')
    expect(result.data[0].attributes['gene_name']).toBe('DDX11L1')
  })
})
