import { Card } from '../ui/Card'
import { InfoTooltip } from '../education/InfoTooltip'

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  termKey?: string
}

export function StatCard({ label, value, subValue, termKey }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        {termKey && <InfoTooltip termKey={termKey} />}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
    </Card>
  )
}
