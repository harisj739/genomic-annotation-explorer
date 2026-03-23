import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Card } from '../ui/Card'
import { InfoTooltip } from '../education/InfoTooltip'
import { formatBp } from '../../utils/formatting'

interface Props {
  data: { chrom: string; coverage: number }[]
}

export function CoverageChart({ data }: Props) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-1 mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Genomic Coverage per Chromosome</h3>
        <InfoTooltip termKey="genomicCoverage" />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 0, bottom: 40 }}>
          <defs>
            <linearGradient id="coverageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="chrom"
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            interval={data.length > 30 ? 'preserveStartEnd' : 0}
          />
          <YAxis tickFormatter={formatBp} tick={{ fontSize: 11 }} width={65} />
          <Tooltip formatter={(v) => [formatBp(Number(v)), 'Coverage']} />
          <Area
            type="monotone"
            dataKey="coverage"
            stroke="#14b8a6"
            strokeWidth={2}
            fill="url(#coverageGradient)"
            dot={{ r: 3, fill: '#14b8a6' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
