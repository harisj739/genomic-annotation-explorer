import type { GenomicRecord, SupportedFormat } from '../types/genomic'
import type { ParseResult, ParserOptions } from '../types/parser'
import { parseBed } from './bed'
import { parseGtf } from './gtf'
import { parseGff } from './gff'

const EXTENSION_MAP: Record<string, SupportedFormat> = {
  bed: 'BED',
  gtf: 'GTF',
  gff: 'GFF2',
  gff3: 'GFF3',
}

export function detectFormat(filename: string): SupportedFormat | null {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSION_MAP[ext] ?? null
}

export function parseGenomicFile(
  content: string,
  format: SupportedFormat,
  opts?: ParserOptions
): ParseResult<GenomicRecord[]> {
  switch (format) {
    case 'BED':  return parseBed(content, opts)
    case 'GTF':  return parseGtf(content, opts)
    case 'GFF2':
    case 'GFF3': return parseGff(content, format, opts)
  }
}
