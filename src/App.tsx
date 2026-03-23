import { useState } from 'react'
import { useGenomicStore } from './store/useGenomicStore'
import { useChartData } from './hooks/useChartData'
import { UploadZone } from './components/upload/UploadZone'
import { FileFormatBadge } from './components/upload/FileFormatBadge'
import { StatsPanel } from './components/stats/StatsPanel'
import { FeatureTypeChart } from './components/charts/FeatureTypeChart'
import { ChromosomeChart } from './components/charts/ChromosomeChart'
import { LengthHistogram } from './components/charts/LengthHistogram'
import { StrandPieChart } from './components/charts/StrandPieChart'
import { CoverageChart } from './components/charts/CoverageChart'
import { GlossaryDrawer } from './components/education/GlossaryDrawer'
import { ChatPanel } from './components/chat/ChatPanel'
import { ErrorBanner } from './components/ui/ErrorBanner'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { Button } from './components/ui/Button'
import { FileHistory } from './components/files/FileHistory'

export default function App() {
  const { status, fileName, format, stats, error, warnings, reset } = useGenomicStore()
  const chartData = useChartData(stats)
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

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
            {status === 'done' && (
              <Button variant="ghost" onClick={() => setChatOpen(true)}>
                Ask Genneth
              </Button>
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
          <div className="max-w-2xl mx-auto pt-8 space-y-8">
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore your genome annotation</h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Upload a BED, GTF, or GFF file to instantly see statistics and visualizations about the annotated features. Great for learning what's in a genome annotation!
                </p>
              </div>
              <UploadZone />
            </div>
            <FileHistory />
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
              <FileFormatBadge
                format={format}
                fileName={fileName}
                featureCount={stats.totalFeatures}
              />
              {warnings.length > 0 && (
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                  {warnings.length} parse warning{warnings.length > 1 ? 's' : ''}
                </span>
              )}
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

                <section aria-label="Visualizations">
                  <h2 className="text-base font-semibold text-gray-700 mb-3">Visualizations</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <FeatureTypeChart data={chartData.featureTypes} />
                    <ChromosomeChart data={chartData.chromosomes} />
                    <LengthHistogram data={chartData.lengthHistogram} />
                    <StrandPieChart data={chartData.strandData} />
                    <div className="lg:col-span-2">
                      <CoverageChart data={chartData.coverage} />
                    </div>
                  </div>
                </section>

                <FileHistory defaultOpen={false} />
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
