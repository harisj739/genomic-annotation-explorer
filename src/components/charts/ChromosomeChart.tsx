import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Card } from '../ui/Card'
import { InfoTooltip } from '../education/InfoTooltip'
import { formatNumber } from '../../utils/formatting'

interface Props {
  data: { chrom: string; count: number }[]
}

export function ChromosomeChart({ data }: Props) {
  // Limit label density for large sets
  const showLabel = data.length <= 30

  return (
    <Card className="p-5">
      <div className="flex items-center gap-1 mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Features per Chromosome</h3>
        <InfoTooltip termKey="chromosomeDistribution" />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ left: 0, right: 8, top: 0, bottom: showLabel ? 40 : 8 }}>
          <XAxis
            dataKey="chrom"
            tick={{ fontSize: 10 }}
            angle={showLabel ? -45 : 0}
            textAnchor="end"
            interval={showLabel ? 0 : 'preserveStartEnd'}
          />
          <YAxis tickFormatter={formatNumber} tick={{ fontSize: 11 }} width={55} />
          <Tooltip formatter={(v) => [formatNumber(Number(v)), 'Features']} cursor={{ fill: '#f3f4f6' }} />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
