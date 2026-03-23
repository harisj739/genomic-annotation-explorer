import { useState, useRef } from 'react'
import { EDUCATION } from '../../constants/education'

interface InfoTooltipProps {
  termKey: string
}

export function InfoTooltip({ termKey }: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const entry = EDUCATION[termKey]
  const btnRef = useRef<HTMLButtonElement>(null)

  if (!entry) return null

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={btnRef}
        className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-help ml-1"
        aria-label={`Info about ${entry.term}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        tabIndex={0}
        type="button"
      >
        ?
      </button>
      {open && (
        <div className="absolute left-6 top-0 z-50 w-72 rounded-xl bg-white border border-gray-200 shadow-xl p-4 text-left pointer-events-none">
          <p className="text-xs font-semibold text-gray-800 mb-1">{entry.term}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{entry.shortDef}</p>
          <p className="text-xs text-gray-400 leading-relaxed mt-2">{entry.detail}</p>
        </div>
      )}
    </span>
  )
}
