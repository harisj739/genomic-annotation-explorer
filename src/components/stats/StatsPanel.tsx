import { useGenomicStore } from '../../store/useGenomicStore'
import { useDashboardStore } from '../../store/useDashboardStore'
import type { PanelKey } from '../../store/useDashboardStore'
import { StatCard } from './StatCard'
import { StrandTable } from './StrandTable'
import { formatNumber, formatBp } from '../../utils/formatting'

function HideOverlay({ panelKey }: { panelKey: PanelKey }) {
  const { customizing, toggleHidden } = useDashboardStore()
  if (!customizing) return null
  return (
    <button
      onClick={() => toggleHidden(panelKey)}
      className="absolute inset-0 z-10 flex items-center justify-center bg-red-500/10 border-2 border-red-400 border-dashed rounded-xl opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
      aria-label="Hide this panel"
    >
      <span className="text-xs font-semibold text-red-600 bg-white px-2 py-0.5 rounded-full shadow">
        Hide
      </span>
    </button>
  )
}

export function StatsPanel() {
  const stats = useGenomicStore((s) => s.stats)
  const { isHidden, hidden, resetLayout } = useDashboardStore()
  if (!stats) return null

  const topTypes = Object.entries(stats.featureTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t)
    .join(', ')

  const statCards: { key: PanelKey; el: React.ReactNode }[] = [
    {
      key: 'stat-total',
      el: <StatCard label="Total Features" value={formatNumber(stats.totalFeatures)} termKey="totalFeatures" />,
    },
    {
      key: 'stat-chroms',
      el: <StatCard label="Chromosomes" value={stats.uniqueChromosomes.length} termKey="uniqueChromosomes" />,
    },
    {
      key: 'stat-types',
      el: <StatCard label="Feature Types" value={Object.keys(stats.featureTypeCounts).length} subValue={topTypes} termKey="featureTypes" />,
    },
    {
      key: 'stat-length',
      el: <StatCard label="Median Length" value={formatBp(stats.medianFeatureLength)} subValue={`Mean: ${formatBp(stats.meanFeatureLength)}`} termKey="featureLength" />,
    },
  ]

  const visibleCards = statCards.filter((c) => !isHidden(c.key))
  const strandHidden = isHidden('stat-strand')

  const statPanelKeys: PanelKey[] = ['stat-total', 'stat-chroms', 'stat-types', 'stat-length', 'stat-strand']
  const hiddenStatCount = statPanelKeys.filter((k) => hidden.includes(k)).length

  // If all stat items are hidden, render nothing
  if (visibleCards.length === 0 && strandHidden) return null

  return (
    <section aria-label="Summary statistics">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-700">Summary</h2>
        {hiddenStatCount > 0 && (
          <button
            onClick={resetLayout}
            className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer"
          >
            {hiddenStatCount} hidden · Reset layout
          </button>
        )}
      </div>

      {visibleCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
          {statCards.map(({ key, el }) =>
            isHidden(key) ? null : (
              <div key={key} className="relative group">
                {el}
                <HideOverlay panelKey={key} />
              </div>
            )
          )}
        </div>
      )}

      {!strandHidden && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative group">
            <StrandTable
              plus={stats.strandCounts.plus}
              minus={stats.strandCounts.minus}
              unknown={stats.strandCounts.unknown}
            />
            <HideOverlay panelKey="stat-strand" />
          </div>
        </div>
      )}
    </section>
  )
}
