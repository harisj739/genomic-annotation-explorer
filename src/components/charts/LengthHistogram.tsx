import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Card } from '../ui/Card'
import { InfoTooltip } from '../education/InfoTooltip'
import { formatNumber } from '../../utils/formatting'

interface Props {
  data: { label: string; count: number }[]
}

export function LengthHistogram({ data }: Props) {
  const nonEmpty = data.filter(d => d.count > 0)
  const showAll = nonEmpty.length <= 20

  return (
    <Card className="p-5">
      <div className="flex items-center gap-1 mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Feature Length Distribution</h3>
        <InfoTooltip termKey="featureLength" />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={nonEmpty} margin={{ left: 0, right: 8, top: 0, bottom: showAll ? 40 : 8 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9 }}
            angle={-45}
            textAnchor="end"
            interval={showAll ? 0 : 'preserveStartEnd'}
          />
          <YAxis tickFormatter={formatNumber} tick={{ fontSize: 11 }} width={55} />
          <Tooltip
            formatter={(v) => [formatNumber(Number(v)), 'Features']}
            labelFormatter={(label) => `Length: ${label}`}
            cursor={{ fill: '#f3f4f6' }}
          />
          <Bar dataKey="count" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
