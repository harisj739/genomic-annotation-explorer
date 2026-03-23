import { create } from 'zustand'

const API_KEY_STORAGE_KEY = 'genomic-explorer-anthropic-key'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatStore {
  messages: ChatMessage[]
  apiKey: string
  isLoading: boolean
  error: string | null

  addMessage: (role: ChatMessage['role'], content: string) => ChatMessage
  setApiKey: (key: string) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

function loadApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  apiKey: loadApiKey(),
  isLoading: false,
  error: null,

  addMessage: (role, content) => {
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role,
      content,
      timestamp: Date.now(),
    }
    set((state) => ({ messages: [...state.messages, msg] }))
    return msg
  },

  setApiKey: (key) => {
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, key)
    } catch {
      // ignore
    }
    set({ apiKey: key })
  },

  clearMessages: () => set({ messages: [], error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}))
