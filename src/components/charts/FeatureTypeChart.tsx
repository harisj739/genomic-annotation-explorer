import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Card } from '../ui/Card'
import { InfoTooltip } from '../education/InfoTooltip'
import { formatNumber } from '../../utils/formatting'

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6']

interface Props {
  data: { name: string; count: number }[]
}

export function FeatureTypeChart({ data }: Props) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-1 mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Feature Type Distribution</h3>
        <InfoTooltip termKey="featureTypes" />
      </div>
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 32)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 0, bottom: 0 }}>
          <XAxis type="number" tickFormatter={formatNumber} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(v) => [formatNumber(Number(v)), 'Count']}
            cursor={{ fill: '#f3f4f6' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
