import type { GenomicRecord } from '../types/genomic'
import type { ParseResult, ParserOptions } from '../types/parser'

const ATTR_RE = /(\w+)\s+"([^"]*)"/g

function parseAttributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  let match: RegExpExecArray | null
  ATTR_RE.lastIndex = 0
  while ((match = ATTR_RE.exec(raw)) !== null) {
    attrs[match[1]] = match[2]
  }
  return attrs
}

function parseScore(raw: string): number | null {
  if (!raw || raw === '.') return null
  const n = Number(raw)
  return isNaN(n) ? null : n
}

export function parseGtf(
  content: string,
  opts: ParserOptions = {}
): ParseResult<GenomicRecord[]> {
  const maxLines = opts.maxLines ?? 2_000_000
  const records: GenomicRecord[] = []
  const warnings: string[] = []
  const lines = content.split('\n')

  for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
    const line = lines[i].trimEnd()
    if (!line || line.startsWith('#')) continue

    const cols = line.split('\t')
    if (cols.length < 8) {
      warnings.push(`Line ${i + 1}: expected 9 columns, got ${cols.length} — skipped`)
      continue
    }

    const startRaw = parseInt(cols[3], 10)
    const endRaw = parseInt(cols[4], 10)

    if (isNaN(startRaw) || isNaN(endRaw)) {
      warnings.push(`Line ${i + 1}: invalid coordinates — skipped`)
      continue
    }

    // GTF is 1-based closed; convert to 0-based half-open
    const start = startRaw - 1
    const end = endRaw

    const strand = (cols[6] === '+' || cols[6] === '-') ? cols[6] : '.'

    const attributes = cols[8] ? parseAttributes(cols[8]) : {}
    if (cols[7] && cols[7] !== '.') attributes['frame'] = cols[7]

    records.push({
      chrom: cols[0],
      start,
      end,
      featureType: cols[2] || 'feature',
      strand,
      score: parseScore(cols[5]),
      source: cols[1] || 'GTF',
      attributes,
      rawLine: line,
    })
  }

  if (records.length === 0) {
    return { ok: false, error: 'No valid GTF records found. Check that the file uses tab-separated columns and is not empty.', warnings }
  }

  return { ok: true, data: records, warnings }
}
