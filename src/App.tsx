import { useState } from 'react'
import { useGenomicStore } from './store/useGenomicStore'
import { useDashboardStore } from './store/useDashboardStore'
import type { PanelKey } from './store/useDashboardStore'
import { useChartData } from './hooks/useChartData'
import { UploadZone } from './components/upload/UploadZone'
import { FileFormatBadge } from './components/upload/FileFormatBadge'
import { StatsPanel } from './components/stats/StatsPanel'
import { FeatureTypeChart } from './components/charts/FeatureTypeChart'
import { ChromosomeChart } from './components/charts/ChromosomeChart'
import { LengthHistogram } from './components/charts/LengthHistogram'
import { StrandPieChart } from './components/charts/StrandPieChart'
import { CoverageChart } from './components/charts/CoverageChart'
import { DynamicChart } from './components/dashboard/DynamicChart'
import { GlossaryDrawer } from './components/education/GlossaryDrawer'
import { ChatPanel } from './components/chat/ChatPanel'
import { SavedFilesMenu } from './components/files/SavedFilesMenu'
import { ErrorBanner } from './components/ui/ErrorBanner'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { Button } from './components/ui/Button'

// Wraps a chart panel with a persistent red hide button in the top-right corner
function HidableChart({
  panelKey,
  fullWidth = false,
  children,
}: {
  panelKey: PanelKey
  fullWidth?: boolean
  children: React.ReactNode
}) {
  const { isHidden, toggleHidden } = useDashboardStore()
  if (isHidden(panelKey)) return null
  return (
    <div className={`relative ${fullWidth ? 'lg:col-span-2' : ''}`}>
      {children}
      <div className="group/hide absolute top-2 right-2 z-10 flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-700 bg-white/95 rounded px-1.5 py-0.5 shadow-sm opacity-0 group-hover/hide:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Hide
        </span>
        <button
          onClick={() => toggleHidden(panelKey)}
          className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow cursor-pointer transition-colors"
          aria-label="Hide this chart"
        >
          <span className="block w-2.5 h-[2px] bg-white rounded-full" />
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const { status, fileName, format, stats, error, warnings, reset, savedFiles } = useGenomicStore()
  const { hidden, resetLayout, aiWidgets } = useDashboardStore()
  const chartData = useChartData(stats)
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [vizOpen, setVizOpen] = useState(true)
  const [headerSavedOpen, setHeaderSavedOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden>🧬</span>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Genome Annotation Explorer</h1>
              <p className="text-xs text-gray-400">Visualize BED, GTF, and GFF files in your browser</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setGlossaryOpen(true)}>
              Glossary
            </Button>
            {savedFiles.length > 0 && (
              <div className="relative">
                <Button variant="ghost" onClick={() => setHeaderSavedOpen((o) => !o)}>
                  Saved Files
                  <svg
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${headerSavedOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                {headerSavedOpen && (
                  <SavedFilesMenu
                    onClose={() => setHeaderSavedOpen(false)}
                    className="top-full right-0"
                  />
                )}
              </div>
            )}
            {status === 'done' && (
              <Button variant="ghost" onClick={reset}>
                New file
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Upload state */}
        {status === 'idle' && (
          <div className="max-w-2xl mx-auto pt-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore your genome annotation</h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Upload a BED, GTF, or GFF file to instantly see statistics and visualizations about the annotated features. Great for learning what's in a genome annotation!
              </p>
            </div>
            <UploadZone />
          </div>
        )}

        {/* Parsing state */}
        {status === 'parsing' && (
          <div className="max-w-2xl mx-auto pt-8">
            <LoadingSpinner label={`Parsing ${fileName ?? 'file'}…`} />
          </div>
        )}

        {/* Error state */}
        {status === 'error' && error && (
          <div className="max-w-2xl mx-auto pt-8 space-y-4">
            <ErrorBanner error={error} warnings={warnings} />
            <div className="text-center">
              <Button onClick={reset}>Try another file</Button>
            </div>
          </div>
        )}

        {/* Done state */}
        {status === 'done' && stats && chartData && format && fileName && (
          <>
            {/* File info bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <FileFormatBadge format={format} fileName={fileName} featureCount={stats.totalFeatures} />
                {hidden.length > 0 && (
                  <button
                    onClick={resetLayout}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gray-700 hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {warnings.length > 0 && (
                  <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                    {warnings.length} parse warning{warnings.length > 1 ? 's' : ''}
                  </span>
                )}
                <button
                  onClick={() => setChatOpen(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 active:from-indigo-700 active:to-purple-700 shadow-sm hover:shadow-md transition-all cursor-pointer select-none"
                >
                  ✨ Ask Genny
                </button>
              </div>
            </div>

            {/* Large file notice */}
            {stats.totalFeatures > 500_000 && (
              <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                Large file: {stats.totalFeatures.toLocaleString()} features loaded. Charts may render more slowly.
              </div>
            )}

            {/* Empty result */}
            {stats.totalFeatures === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg mb-2">No features to display</p>
                <p className="text-sm">The file may contain only comments or header lines.</p>
              </div>
            )}

            {stats.totalFeatures > 0 && (
              <>
                <StatsPanel />

                {/* Visualizations */}
                <section aria-label="Visualizations">
                  <button
                    className="w-full flex items-center justify-between mb-3 cursor-pointer group"
                    onClick={() => setVizOpen((o) => !o)}
                    aria-expanded={vizOpen}
                  >
                    <h2 className="text-base font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">Visualizations</h2>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${vizOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {vizOpen && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <HidableChart panelKey="chart-featuretype">
                      <FeatureTypeChart data={chartData.featureTypes} />
                    </HidableChart>
                    <HidableChart panelKey="chart-chromosome">
                      <ChromosomeChart data={chartData.chromosomes} />
                    </HidableChart>
                    <HidableChart panelKey="chart-histogram">
                      <LengthHistogram data={chartData.lengthHistogram} />
                    </HidableChart>
                    <HidableChart panelKey="chart-strand">
                      <StrandPieChart data={chartData.strandData} />
                    </HidableChart>
                    <HidableChart panelKey="chart-coverage" fullWidth>
                      <CoverageChart data={chartData.coverage} />
                    </HidableChart>
                  </div>}
                </section>

                {/* Genny-generated widgets */}
                {aiWidgets.length > 0 && (
                  <section aria-label="Genny widgets">
                    <h2 className="text-base font-semibold text-gray-700 mb-3">
                      Genny's Charts
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {aiWidgets.map((widget) => (
                        <DynamicChart key={widget.id} widget={widget} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </main>

      <GlossaryDrawer open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}
