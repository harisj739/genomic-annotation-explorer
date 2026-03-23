export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

export function formatBp(bp: number): string {
  if (bp >= 1_000_000) return `${(bp / 1_000_000).toFixed(2)} Mb`
  if (bp >= 1_000) return `${(bp / 1_000).toFixed(1)} kb`
  return `${bp} bp`
}

export function formatPosition(pos: number): string {
  // Display 1-based position to users (internally 0-based)
  return formatNumber(pos + 1)
}
