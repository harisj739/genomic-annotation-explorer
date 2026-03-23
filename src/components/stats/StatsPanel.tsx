import { useGenomicStore } from '../../store/useGenomicStore'
import { StatCard } from './StatCard'
import { StrandTable } from './StrandTable'
import { formatNumber, formatBp } from '../../utils/formatting'

export function StatsPanel() {
  const stats = useGenomicStore(s => s.stats)
  if (!stats) return null

  const topTypes = Object.entries(stats.featureTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t)
    .join(', ')

  return (
    <section aria-label="Summary statistics">
      <h2 className="text-base font-semibold text-gray-700 mb-3">Summary</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
        <StatCard
          label="Total Features"
          value={formatNumber(stats.totalFeatures)}
          termKey="totalFeatures"
        />
        <StatCard
          label="Chromosomes"
          value={stats.uniqueChromosomes.length}
          termKey="uniqueChromosomes"
        />
        <StatCard
          label="Feature Types"
          value={Object.keys(stats.featureTypeCounts).length}
          subValue={topTypes}
          termKey="featureTypes"
        />
        <StatCard
          label="Median Length"
          value={formatBp(stats.medianFeatureLength)}
          subValue={`Mean: ${formatBp(stats.meanFeatureLength)}`}
          termKey="featureLength"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StrandTable
          plus={stats.strandCounts.plus}
          minus={stats.strandCounts.minus}
          unknown={stats.strandCounts.unknown}
        />
      </div>
    </section>
  )
}
