import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Card } from '../ui/Card'
import { InfoTooltip } from '../education/InfoTooltip'
import { formatNumber } from '../../utils/formatting'

const STRAND_COLORS: Record<string, string> = {
  '+ forward': '#3b82f6',
  '− reverse': '#f43f5e',
  '. unknown': '#d1d5db',
}

interface Props {
  data: { name: string; value: number }[]
}

export function StrandPieChart({ data }: Props) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-1 mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Strand Distribution</h3>
        <InfoTooltip termKey="strandDistribution" />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={STRAND_COLORS[entry.name] ?? '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [formatNumber(Number(v)), 'Features']} />
          <Legend iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
