import { useMemo } from 'react'
import type { GenomicStats } from '../types/genomic'

const CHR_SPECIAL_ORDER = ['chrX', 'chrY', 'chrM', 'MT', 'X', 'Y', 'M']

function sortChromosomes(chroms: string[]): string[] {
  return [...chroms].sort((a, b) => {
    const aNum = parseInt(a.replace(/^chr/, ''), 10)
    const bNum = parseInt(b.replace(/^chr/, ''), 10)
    const aIsNum = !isNaN(aNum)
    const bIsNum = !isNaN(bNum)
    const aIsSpecial = CHR_SPECIAL_ORDER.includes(a)
    const bIsSpecial = CHR_SPECIAL_ORDER.includes(b)

    if (aIsNum && bIsNum) return aNum - bNum
    if (aIsNum) return -1
    if (bIsNum) return 1
    if (aIsSpecial && bIsSpecial) {
      return CHR_SPECIAL_ORDER.indexOf(a) - CHR_SPECIAL_ORDER.indexOf(b)
    }
    if (aIsSpecial) return 1
    if (bIsSpecial) return -1
    return a.localeCompare(b)
  })
}

function makeBins(values: number[], binCount: number): { label: string; count: number }[] {
  if (values.length === 0) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (min === max) return [{ label: `${min}`, count: values.length }]

  const binSize = (max - min) / binCount
  const bins = Array.from({ length: binCount }, (_, i) => ({
    label: formatBinLabel(min + i * binSize, min + (i + 1) * binSize),
    count: 0,
  }))

  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / binSize), binCount - 1)
    bins[idx].count++
  }

  return bins
}

function formatBinLabel(lo: number, hi: number): string {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(0)}k`
    : `${Math.round(n)}`
  return `${fmt(lo)}–${fmt(hi)}`
}

export interface ChartData {
  featureTypes: { name: string; count: number }[]
  chromosomes: { chrom: string; count: number }[]
  lengthHistogram: { label: string; count: number }[]
  strandData: { name: string; value: number }[]
  coverage: { chrom: string; coverage: number }[]
}

export function useChartData(stats: GenomicStats | null): ChartData | null {
  return useMemo(() => {
    if (!stats) return null

    const featureTypes = Object.entries(stats.featureTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }))

    const sortedChroms = sortChromosomes(Object.keys(stats.chromosomeCounts))
    const chromosomes = sortedChroms.map(chrom => ({
      chrom,
      count: stats.chromosomeCounts[chrom],
    }))

    const coverage = sortedChroms
      .filter(c => stats.coverageByChrom[c])
      .map(chrom => ({
        chrom,
        coverage: stats.coverageByChrom[chrom],
      }))

    const lengthHistogram = makeBins(stats.lengthDistribution, 30)

    const strandData = [
      { name: '+ forward', value: stats.strandCounts.plus },
      { name: '− reverse', value: stats.strandCounts.minus },
      { name: '. unknown', value: stats.strandCounts.unknown },
    ].filter(d => d.value > 0)

    return { featureTypes, chromosomes, lengthHistogram, strandData, coverage }
  }, [stats])
}
