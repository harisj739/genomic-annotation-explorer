import { useState } from 'react'
import { useGenomicStore } from '../../store/useGenomicStore'
import { useDashboardStore } from '../../store/useDashboardStore'
import type { PanelKey } from '../../store/useDashboardStore'
import { StatCard } from './StatCard'
import { StrandTable } from './StrandTable'
import { formatNumber, formatBp } from '../../utils/formatting'

function HideButton({ panelKey }: { panelKey: PanelKey }) {
  const { toggleHidden } = useDashboardStore()
  return (
    <div className="group/hide absolute top-2 right-2 z-10 flex items-center gap-1.5">
      <span className="text-xs font-medium text-gray-700 bg-white/95 rounded px-1.5 py-0.5 shadow-sm opacity-0 group-hover/hide:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Hide
      </span>
      <button
        onClick={() => toggleHidden(panelKey)}
        className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow cursor-pointer transition-colors"
        aria-label="Hide panel"
      >
        <span className="block w-2.5 h-[2px] bg-white rounded-full" />
      </button>
    </div>
  )
}

const Caret = ({ open }: { open: boolean }) => (
  <svg
    className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

export function StatsPanel() {
  const stats = useGenomicStore((s) => s.stats)
  const { isHidden } = useDashboardStore()
  const [open, setOpen] = useState(true)
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

  const strandHidden = isHidden('stat-strand')
  const visibleCards = statCards.filter((c) => !isHidden(c.key))

  if (visibleCards.length === 0 && strandHidden) return null

  return (
    <section aria-label="Summary statistics">
      <button
        className="w-full flex items-center justify-between mb-3 cursor-pointer group"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">Summary</h2>
          {!open && (() => {
            const count = visibleCards.length + (strandHidden ? 0 : 1)
            return count > 0 ? (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                {count}
              </span>
            ) : null
          })()}
        </div>
        <Caret open={open} />
      </button>

      {open && (
        <>
          {visibleCards.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
              {statCards.map(({ key, el }) =>
                isHidden(key) ? null : (
                  <div key={key} className="relative">
                    {el}
                    <HideButton panelKey={key} />
                  </div>
                )
              )}
            </div>
          )}

          {!strandHidden && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <StrandTable
                  plus={stats.strandCounts.plus}
                  minus={stats.strandCounts.minus}
                  unknown={stats.strandCounts.unknown}
                />
                <HideButton panelKey="stat-strand" />
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
