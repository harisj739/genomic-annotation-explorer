import type { GenomicRecord, GenomicStats, SupportedFormat } from '../types/genomic'

export function computeStatistics(
  records: GenomicRecord[],
  format: SupportedFormat
): GenomicStats {
  const featureTypeCounts: Record<string, number> = {}
  const chromosomeCounts: Record<string, number> = {}
  const coverageByChrom: Record<string, number> = {}
  const strandCounts = { plus: 0, minus: 0, unknown: 0 }
  const lengthDistribution: number[] = []

  for (const rec of records) {
    // Feature types
    featureTypeCounts[rec.featureType] = (featureTypeCounts[rec.featureType] ?? 0) + 1

    // Chromosomes
    chromosomeCounts[rec.chrom] = (chromosomeCounts[rec.chrom] ?? 0) + 1

    // Coverage
    const len = rec.end - rec.start
    coverageByChrom[rec.chrom] = (coverageByChrom[rec.chrom] ?? 0) + len
    lengthDistribution.push(len)

    // Strand
    if (rec.strand === '+') strandCounts.plus++
    else if (rec.strand === '-') strandCounts.minus++
    else strandCounts.unknown++
  }

  const uniqueChromosomes = Object.keys(chromosomeCounts)

  const mean = lengthDistribution.length > 0
    ? lengthDistribution.reduce((a, b) => a + b, 0) / lengthDistribution.length
    : 0

  const median = computeMedian(lengthDistribution)

  return {
    totalFeatures: records.length,
    uniqueChromosomes,
    featureTypeCounts,
    strandCounts,
    chromosomeCounts,
    lengthDistribution,
    coverageByChrom,
    meanFeatureLength: Math.round(mean),
    medianFeatureLength: median,
    format,
  }
}

function computeMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}
