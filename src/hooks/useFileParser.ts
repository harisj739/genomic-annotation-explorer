import { useCallback } from 'react'
import { detectFormat, parseGenomicFile } from '../parsers'
import { computeStatistics } from '../analysis/statistics'
import { useGenomicStore } from '../store/useGenomicStore'

const MAX_FILE_SIZE = 200 * 1024 * 1024 // 200 MB hard limit

export function useFileParser() {
  const { startParsing, setParsed, setError } = useGenomicStore()

  const parseFile = useCallback((file: File) => {
    const format = detectFormat(file.name)

    if (!format) {
      setError(
        `Unsupported file type: ".${file.name.split('.').pop()}". Please upload a .bed, .gtf, .gff, or .gff3 file.`
      )
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(0)} MB). Maximum supported size is 200 MB.`)
      return
    }

    startParsing(file.name, format)

    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target?.result as string
      if (!content) {
        setError('Could not read the file. It may be empty or corrupted.')
        return
      }

      const result = parseGenomicFile(content, format)

      if (!result.ok) {
        setError(result.error, result.warnings)
        return
      }

      const stats = computeStatistics(result.data, format)
      setParsed(result.data, stats, result.warnings)
    }

    reader.onerror = () => {
      setError('Failed to read the file. Please try again.')
    }

    reader.readAsText(file)
  }, [startParsing, setParsed, setError])

  return { parseFile }
}
