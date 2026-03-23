import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts'
import { useChartData } from '../../hooks/useChartData'
import { useGenomicStore } from '../../store/useGenomicStore'
import { useDashboardStore } from '../../store/useDashboardStore'
import type { AIWidget } from '../../store/useDashboardStore'
import { formatNumber, formatBp } from '../../utils/formatting'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16', '#ef4444']
const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6']

type NormalizedEntry = { label: string; value: number }

function useNormalizedData(widget: AIWidget): NormalizedEntry[] {
  const stats = useGenomicStore((s) => s.stats)
  const chartData = useChartData(stats)
  if (!chartData) return []

  switch (widget.dataKey) {
    case 'featureTypes':
      return chartData.featureTypes.map((d) => ({ label: d.name, value: d.count }))
    case 'chromosomes':
      return chartData.chromosomes.map((d) => ({ label: d.chrom, value: d.count }))
    case 'strandData':
      return chartData.strandData.map((d) => ({ label: d.name, value: d.value }))
    case 'coverage':
      return chartData.coverage.map((d) => ({ label: d.chrom, value: d.coverage }))
    case 'lengthHistogram':
      return chartData.lengthHistogram.map((d) => ({ label: d.label, value: d.count }))
  }
}

type TooltipValue = number | string | undefined
function valueFormatter(dataKey: AIWidget['dataKey'], value: TooltipValue): string {
  if (typeof value !== 'number') return String(value ?? '')
  if (dataKey === 'coverage') return formatBp(value)
  return formatNumber(value)
}

interface DynamicChartProps {
  widget: AIWidget
}

export function DynamicChart({ widget }: DynamicChartProps) {
  const data = useNormalizedData(widget)
  const { removeAIWidget } = useDashboardStore()

  const fmt = (v: TooltipValue) => valueFormatter(widget.dataKey, v)

  const inner = () => {
    if (widget.chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => fmt(v as TooltipValue)} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      )
    }

    if (widget.chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 4, bottom: 40 }}>
            <defs>
              <linearGradient id="dyn-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={fmt} width={60} />
            <Tooltip formatter={(v) => fmt(v as TooltipValue)} />
            <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#dyn-grad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )
    }

    if (widget.chartType === 'horizontal-bar') {
      const height = Math.max(180, data.length * 28)
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={fmt} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={90} />
            <Tooltip formatter={(v) => fmt(v as TooltipValue)} />
            <Bar dataKey="value" radius={[0, 3, 3, 0]}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )
    }

    // vertical-bar and histogram
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ left: 8, right: 8, top: 4, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={fmt} width={60} />
          <Tooltip formatter={(v) => fmt(v as TooltipValue)} />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="relative group bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{widget.title}</h3>
        <span className="text-xs text-indigo-400 font-medium bg-indigo-50 rounded-full px-2 py-0.5">
          Genny
        </span>
      </div>
      {inner()}
      {/* Remove button */}
      <div className="group/hide absolute top-2 right-2 z-10 flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-700 bg-white/95 rounded px-1.5 py-0.5 shadow-sm opacity-0 group-hover/hide:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Hide
        </span>
        <button
          onClick={() => removeAIWidget(widget.id)}
          className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow cursor-pointer transition-colors"
          aria-label={`Remove ${widget.title}`}
        >
          <span className="block w-2.5 h-[2px] bg-white rounded-full" />
        </button>
      </div>
    </div>
  )
}
