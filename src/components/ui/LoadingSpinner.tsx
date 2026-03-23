export function LoadingSpinner({ label = 'Parsing file…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}
