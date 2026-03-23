import { useRef, useState } from 'react'
import { useFileParser } from '../../hooks/useFileParser'

const ACCEPTED_EXTENSIONS = ['.bed', '.gtf', '.gff', '.gff3']

export function UploadZone() {
  const { parseFile } = useFileParser()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFile(file: File) {
    parseFile(file)
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function onDragLeave() {
    setIsDragging(false)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  return (
    <div
      className={`
        border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors
        ${isDragging
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'
        }
      `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload genomic annotation file"
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        className="hidden"
        onChange={onInputChange}
      />

      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
          🧬
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">
            {isDragging ? 'Drop your file here' : 'Upload a genome annotation file'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop, or click to browse
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {ACCEPTED_EXTENSIONS.map(ext => (
            <span key={ext} className="text-xs font-mono bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-600">
              {ext}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 max-w-sm">
          Files are processed entirely in your browser — nothing is uploaded to any server.
        </p>
      </div>
    </div>
  )
}
