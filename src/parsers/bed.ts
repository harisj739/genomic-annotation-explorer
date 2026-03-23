import type { GenomicRecord } from '../types/genomic'
import type { ParseResult, ParserOptions } from '../types/parser'

const SKIP_PREFIXES = ['track', 'browser', '#']

function parseScore(raw: string): number | null {
  if (!raw || raw === '.') return null
  const n = Number(raw)
  return isNaN(n) ? null : n
}

export function parseBed(
  content: string,
  opts: ParserOptions = {}
): ParseResult<GenomicRecord[]> {
  const maxLines = opts.maxLines ?? 2_000_000
  const records: GenomicRecord[] = []
  const warnings: string[] = []
  const lines = content.split('\n')

  for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
    const line = lines[i].trimEnd()
    if (!line) continue

    const isSkip = SKIP_PREFIXES.some(p => line.startsWith(p))
    if (isSkip) continue

    const cols = line.split('\t')
    if (cols.length < 3) {
      warnings.push(`Line ${i + 1}: expected at least 3 columns, got ${cols.length} — skipped`)
      continue
    }

    const chrom = cols[0]
    const start = parseInt(cols[1], 10)
    const end = parseInt(cols[2], 10)

    if (isNaN(start) || isNaN(end)) {
      warnings.push(`Line ${i + 1}: invalid coordinates — skipped`)
      continue
    }

    const attributes: Record<string, string> = {}
    if (cols[3]) attributes['name'] = cols[3]
    if (cols[7]) attributes['thickStart'] = cols[7]
    if (cols[8]) attributes['thickEnd'] = cols[8]
    if (cols[9]) attributes['itemRgb'] = cols[9]
    if (cols[10]) attributes['blockCount'] = cols[10]
    if (cols[11]) attributes['blockSizes'] = cols[11]
    if (cols[12]) attributes['blockStarts'] = cols[12]

    const strand = (cols[5] === '+' || cols[5] === '-') ? cols[5] : '.'

    records.push({
      chrom,
      start,
      end,
      featureType: 'region',
      strand,
      score: parseScore(cols[4]),
      source: 'BED',
      attributes,
      rawLine: line,
    })
  }

  if (records.length === 0) {
    return { ok: false, error: 'No valid BED records found. Check that the file is non-empty and uses tab-separated columns.', warnings }
  }

  return { ok: true, data: records, warnings }
}
