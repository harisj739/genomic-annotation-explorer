interface ErrorBannerProps {
  error: string
  warnings?: string[]
}

export function ErrorBanner({ error, warnings = [] }: ErrorBannerProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
      <div className="flex items-start gap-2">
        <span className="text-red-500 mt-0.5 flex-shrink-0" aria-hidden>✕</span>
        <p className="text-sm text-red-700 font-medium">{error}</p>
      </div>
      {warnings.length > 0 && (
        <ul className="ml-6 space-y-1">
          {warnings.slice(0, 5).map((w, i) => (
            <li key={i} className="text-xs text-red-600">{w}</li>
          ))}
          {warnings.length > 5 && (
            <li className="text-xs text-red-500">…and {warnings.length - 5} more warnings</li>
          )}
        </ul>
      )}
    </div>
  )
}
