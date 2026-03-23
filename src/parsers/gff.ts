import type { GenomicRecord } from '../types/genomic'
import type { ParseResult, ParserOptions } from '../types/parser'
import type { SupportedFormat } from '../types/genomic'

function parseGff3Attributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const pair of raw.split(';')) {
    const eq = pair.indexOf('=')
    if (eq === -1) continue
    const key = pair.slice(0, eq).trim()
    const val = pair.slice(eq + 1).trim()
    try {
      attrs[key] = decodeURIComponent(val)
    } catch {
      attrs[key] = val
    }
  }
  return attrs
}

function parseGff2Attributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  // GFF2: key "value" ; key "value" or key value ; key value
  const pairs = raw.split(';')
  for (const pair of pairs) {
    const trimmed = pair.trim()
    if (!trimmed) continue
    const spaceIdx = trimmed.indexOf(' ')
    if (spaceIdx === -1) continue
    const key = trimmed.slice(0, spaceIdx)
    let val = trimmed.slice(spaceIdx + 1).trim()
    // Remove surrounding quotes if present
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1)
    }
    attrs[key] = val
  }
  return attrs
}

function detectGff3(lines: string[]): boolean {
  for (const line of lines) {
    if (line.startsWith('##gff-version')) {
      return line.includes('3')
    }
    if (line.startsWith('#')) continue
    if (!line.trim()) continue
    // Heuristic: GFF3 uses key=value attributes
    const cols = line.split('\t')
    if (cols.length >= 9) {
      return cols[8].includes('=')
    }
    break
  }
  return false
}

function parseScore(raw: string): number | null {
  if (!raw || raw === '.') return null
  const n = Number(raw)
  return isNaN(n) ? null : n
}

export function parseGff(
  content: string,
  formatHint: SupportedFormat,
  opts: ParserOptions = {}
): ParseResult<GenomicRecord[]> {
  const maxLines = opts.maxLines ?? 2_000_000
  const records: GenomicRecord[] = []
  const warnings: string[] = []
  const lines = content.split('\n')

  const isGff3 = formatHint === 'GFF3' || detectGff3(lines.slice(0, 20))
  const detectedFormat: SupportedFormat = isGff3 ? 'GFF3' : 'GFF2'

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

    // GFF is 1-based closed; convert to 0-based half-open
    const start = startRaw - 1
    const end = endRaw

    const strand = (cols[6] === '+' || cols[6] === '-') ? cols[6] : '.'

    const rawAttrs = cols[8] || ''
    const attributes = isGff3
      ? parseGff3Attributes(rawAttrs)
      : parseGff2Attributes(rawAttrs)

    if (cols[7] && cols[7] !== '.') attributes['frame'] = cols[7]

    records.push({
      chrom: cols[0],
      start,
      end,
      featureType: cols[2] || 'feature',
      strand,
      score: parseScore(cols[5]),
      source: cols[1] || detectedFormat,
      attributes,
      rawLine: line,
    })
  }

  if (records.length === 0) {
    return {
      ok: false,
      error: `No valid ${detectedFormat} records found. Check that the file uses tab-separated columns and is not empty.`,
      warnings,
    }
  }

  return { ok: true, data: records, warnings }
}
