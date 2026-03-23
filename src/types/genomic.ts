export interface GenomicRecord {
  chrom: string
  start: number               // 0-based (GTF/GFF converted on parse)
  end: number                 // exclusive end
  featureType: string         // "exon", "gene", "region" (BED default)
  strand: '+' | '-' | '.'
  score: number | null
  source: string              // GTF/GFF col 2; "BED" for BED files
  attributes: Record<string, string>
  rawLine: string             // original source line for this record only
}

export interface GenomicStats {
  totalFeatures: number
  uniqueChromosomes: string[]
  featureTypeCounts: Record<string, number>
  strandCounts: { plus: number; minus: number; unknown: number }
  chromosomeCounts: Record<string, number>
  lengthDistribution: number[]         // (end - start) per record
  coverageByChrom: Record<string, number> // sum of lengths per chrom
  meanFeatureLength: number
  medianFeatureLength: number
  format: SupportedFormat
}

export type SupportedFormat = 'BED' | 'GTF' | 'GFF2' | 'GFF3'

// Discriminated union — stubs for future BAM/VCF support
export type GenomicFile =
  | { kind: 'annotation'; format: SupportedFormat; records: GenomicRecord[] }
  | { kind: 'alignment';  format: 'BAM' | 'SAM';  records: never }
  | { kind: 'variant';    format: 'VCF' | 'BCF';  records: never }
