import { useEffect } from 'react'
import { GLOSSARY_TERMS } from '../../constants/education'

interface GlossaryDrawerProps {
  open: boolean
  onClose: () => void
}

export function GlossaryDrawer({ open, onClose }: GlossaryDrawerProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 overflow-y-auto ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Genomics glossary"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Glossary</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
            aria-label="Close glossary"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {GLOSSARY_TERMS.map(entry => (
            <div key={entry.term} className="border-b border-gray-100 pb-5 last:border-0">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{entry.term}</h3>
              <p className="text-sm text-gray-500 mb-2">{entry.shortDef}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{entry.detail}</p>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
