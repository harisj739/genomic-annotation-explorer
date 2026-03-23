import { useEffect, useRef, useState } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { useChatStore } from '../../store/useChatStore'
import { useGenomicStore } from '../../store/useGenomicStore'
import { ChatMessage } from './ChatMessage'
import { formatNumber, formatBp } from '../../utils/formatting'
import type { GenomicStats, SupportedFormat } from '../../types/genomic'

interface ChatPanelProps {
  open: boolean
  onClose: () => void
}

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(
  fileName: string,
  format: SupportedFormat,
  stats: GenomicStats,
): string {
  const topChroms = stats.uniqueChromosomes.slice(0, 10).join(', ')
  const moreChromsNote =
    stats.uniqueChromosomes.length > 10
      ? ` (and ${stats.uniqueChromosomes.length - 10} more)`
      : ''

  const featureTypes = Object.entries(stats.featureTypeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([k, v]) => `${k}: ${formatNumber(v)}`)
    .join(', ')

  const topCoverage = Object.entries(stats.coverageByChrom)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([k, v]) => `${k}: ${formatBp(v)}`)
    .join(', ')

  return `You are Genny, an AI genomic annotation assistant embedded in the Genome Annotation Explorer app.

FILE CONTEXT:
- File name: ${fileName}
- Format: ${format}
- Total features: ${formatNumber(stats.totalFeatures)}
- Chromosomes (${stats.uniqueChromosomes.length}): ${topChroms}${moreChromsNote}
- Feature types: ${featureTypes}
- Strand distribution: forward (+): ${formatNumber(stats.strandCounts.plus)}, reverse (-): ${formatNumber(stats.strandCounts.minus)}, unknown (.): ${formatNumber(stats.strandCounts.unknown)}
- Mean feature length: ${formatNumber(stats.meanFeatureLength)} bp
- Median feature length: ${formatNumber(stats.medianFeatureLength)} bp
- Top coverage by chromosome: ${topCoverage}

INSTRUCTIONS:
- You are Genny. Be helpful, precise, and educational about genomic annotation data.
- ONLY answer questions directly related to the file described above and its data.
- If asked anything unrelated to this file or genomics in general that is not about this file, politely decline and remind the user you can only discuss the loaded file.
- Use correct bioinformatics terminology and explain terms when it helps the user understand.
- Keep responses concise and focused.`
}

// ── Intro message ─────────────────────────────────────────────────────────────

function buildIntroMessage(
  fileName: string,
  format: SupportedFormat,
  stats: GenomicStats,
): string {
  return `Hi! I'm Genny, your genomic annotation assistant. 🧬\n\nI've loaded **${fileName}** (${format} format) — it contains ${formatNumber(stats.totalFeatures)} features across ${stats.uniqueChromosomes.length} chromosome${stats.uniqueChromosomes.length !== 1 ? 's' : ''}.\n\nAsk me anything about this file!`
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { messages, apiKey, isLoading, error, addMessage, setApiKey, setLoading, setError, clearMessages } =
    useChatStore()
  const { stats, fileName, format } = useGenomicStore()

  const [input, setInput] = useState('')
  const [keyDraft, setKeyDraft] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // ESC to close
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Show intro message when panel first opens (no messages yet)
  useEffect(() => {
    if (open && messages.length === 0 && stats && fileName && format) {
      addMessage('assistant', buildIntroMessage(fileName, format, stats))
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear messages when the file changes
  useEffect(() => {
    clearMessages()
  }, [fileName]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  async function sendMessage() {
    if (!input.trim() || isLoading || !stats || !fileName || !format) return
    if (!apiKey) {
      setShowKeyInput(true)
      return
    }

    const userText = input.trim()
    setInput('')
    setError(null)
    addMessage('user', userText)
    setLoading(true)

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
      const history = useChatStore.getState().messages
      const apiMessages = history
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: buildSystemPrompt(fileName, format, stats),
        messages: apiMessages,
      })

      const text =
        response.content[0]?.type === 'text' ? response.content[0].text : '(no response)'
      addMessage('assistant', text)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to reach Genny: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function saveApiKey() {
    if (!keyDraft.trim()) return
    setApiKey(keyDraft.trim())
    setKeyDraft('')
    setShowKeyInput(false)
  }

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
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-50 z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Genny AI assistant"
      >
        {/* Header */}
        <div className="shrink-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>🧬</span>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 leading-tight">Genny</h2>
              <p className="text-xs text-gray-400">AI genomic assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput((v) => !v)}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
              title={apiKey ? 'API key is set — click to change' : 'Set API key'}
            >
              {apiKey ? '🔑 Key set' : '🔑 Add key'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* API key input (collapsible) */}
        {showKeyInput && (
          <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-5 py-3 space-y-2">
            <p className="text-xs text-amber-700 font-medium">Enter your Anthropic API key</p>
            <p className="text-xs text-amber-600">
              Your key is stored only in this browser and never sent anywhere except Anthropic's API.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveApiKey() }}
                placeholder="sk-ant-..."
                className="flex-1 text-xs border border-amber-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
              <button
                onClick={saveApiKey}
                disabled={!keyDraft.trim()}
                className="text-xs bg-amber-500 text-white px-3 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-40 transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-1">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input footer */}
        <div className="shrink-0 bg-white border-t border-gray-100 px-4 py-3">
          {!apiKey && (
            <p className="text-xs text-amber-600 mb-2 text-center">
              Add your Anthropic API key above to chat with Genny.
            </p>
          )}
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this file… (Enter to send)"
              rows={2}
              disabled={isLoading || !apiKey}
              className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || !apiKey}
              className="shrink-0 bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 transition-colors cursor-pointer"
              aria-label="Send message"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-300 mt-1.5 text-center">
            Shift+Enter for new line · Genny only discusses the loaded file
          </p>
        </div>
      </aside>
    </>
  )
}
