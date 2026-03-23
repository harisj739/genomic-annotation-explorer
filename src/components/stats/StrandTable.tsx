import { Card } from '../ui/Card'
import { InfoTooltip } from '../education/InfoTooltip'
import { formatNumber } from '../../utils/formatting'

interface StrandTableProps {
  plus: number
  minus: number
  unknown: number
}

export function StrandTable({ plus, minus, unknown }: StrandTableProps) {
  const total = plus + minus + unknown
  const pct = (n: number) => total > 0 ? `${((n / total) * 100).toFixed(1)}%` : '0%'

  const rows = [
    { label: '+ (forward)', count: plus, color: 'bg-blue-500' },
    { label: '− (reverse)', count: minus, color: 'bg-rose-500' },
    { label: '. (unknown)', count: unknown, color: 'bg-gray-300' },
  ]

  return (
    <Card className="p-5">
      <div className="flex items-center gap-1 mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Strand Breakdown</span>
        <InfoTooltip termKey="strandDistribution" />
      </div>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-100">
          {rows.map(row => (
            <tr key={row.label}>
              <td className="py-1.5 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${row.color} flex-shrink-0`} />
                <span className="text-gray-700 font-mono">{row.label}</span>
              </td>
              <td className="py-1.5 text-right text-gray-900 font-medium">{formatNumber(row.count)}</td>
              <td className="py-1.5 text-right text-gray-400 w-14">{pct(row.count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
