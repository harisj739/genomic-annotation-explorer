import { describe, it, expect } from 'vitest'
import { computeStatistics } from './statistics'
import type { GenomicRecord } from '../types/genomic'

const makeRecord = (overrides: Partial<GenomicRecord> = {}): GenomicRecord => ({
  chrom: 'chr1',
  start: 0,
  end: 100,
  featureType: 'exon',
  strand: '+',
  score: null,
  source: 'test',
  attributes: {},
  rawLine: '',
  ...overrides,
})

const records: GenomicRecord[] = [
  makeRecord({ chrom: 'chr1', start: 0, end: 100, featureType: 'gene', strand: '+' }),
  makeRecord({ chrom: 'chr1', start: 200, end: 400, featureType: 'exon', strand: '+' }),
  makeRecord({ chrom: 'chr2', start: 0, end: 50, featureType: 'exon', strand: '-' }),
  makeRecord({ chrom: 'chrX', start: 0, end: 1000, featureType: 'CDS', strand: '.' }),
]

describe('computeStatistics', () => {
  it('counts total features', () => {
    const stats = computeStatistics(records, 'GTF')
    expect(stats.totalFeatures).toBe(4)
  })

  it('identifies unique chromosomes', () => {
    const stats = computeStatistics(records, 'GTF')
    expect(stats.uniqueChromosomes).toContain('chr1')
    expect(stats.uniqueChromosomes).toContain('chr2')
    expect(stats.uniqueChromosomes).toContain('chrX')
    expect(stats.uniqueChromosomes).toHaveLength(3)
  })

  it('counts feature types', () => {
    const stats = computeStatistics(records, 'GTF')
    expect(stats.featureTypeCounts['gene']).toBe(1)
    expect(stats.featureTypeCounts['exon']).toBe(2)
    expect(stats.featureTypeCounts['CDS']).toBe(1)
  })

  it('counts strands', () => {
    const stats = computeStatistics(records, 'GTF')
    expect(stats.strandCounts.plus).toBe(2)
    expect(stats.strandCounts.minus).toBe(1)
    expect(stats.strandCounts.unknown).toBe(1)
  })

  it('computes length distribution', () => {
    const stats = computeStatistics(records, 'GTF')
    // lengths: 100, 200, 50, 1000
    expect(stats.lengthDistribution).toEqual([100, 200, 50, 1000])
  })

  it('computes mean feature length', () => {
    const stats = computeStatistics(records, 'GTF')
    // (100 + 200 + 50 + 1000) / 4 = 337.5 → rounded = 338
    expect(stats.meanFeatureLength).toBe(338)
  })

  it('computes median feature length', () => {
    const stats = computeStatistics(records, 'GTF')
    // sorted: [50, 100, 200, 1000] → median = (100 + 200) / 2 = 150
    expect(stats.medianFeatureLength).toBe(150)
  })

  it('computes coverage by chromosome', () => {
    const stats = computeStatistics(records, 'GTF')
    expect(stats.coverageByChrom['chr1']).toBe(300) // 100 + 200
    expect(stats.coverageByChrom['chr2']).toBe(50)
    expect(stats.coverageByChrom['chrX']).toBe(1000)
  })

  it('handles empty records', () => {
    const stats = computeStatistics([], 'BED')
    expect(stats.totalFeatures).toBe(0)
    expect(stats.meanFeatureLength).toBe(0)
    expect(stats.medianFeatureLength).toBe(0)
  })
})
