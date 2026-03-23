import type { SupportedFormat } from '../../types/genomic'
import { formatNumber } from '../../utils/formatting'

const FORMAT_COLORS: Record<SupportedFormat, string> = {
  BED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  GTF: 'bg-blue-100 text-blue-800 border-blue-200',
  GFF2: 'bg-purple-100 text-purple-800 border-purple-200',
  GFF3: 'bg-violet-100 text-violet-800 border-violet-200',
}

interface FileFormatBadgeProps {
  format: SupportedFormat
  fileName: string
  featureCount: number
}

export function FileFormatBadge({ format, fileName, featureCount }: FileFormatBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${FORMAT_COLORS[format]}`}>
        {format}
      </span>
      <span className="text-sm text-gray-600 truncate max-w-xs" title={fileName}>
        {fileName}
      </span>
      <span className="text-sm text-gray-500">
        {formatNumber(featureCount)} features
      </span>
    </div>
  )
}
