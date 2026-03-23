import { create } from 'zustand'

export type PanelKey =
  | 'stat-total'
  | 'stat-chroms'
  | 'stat-types'
  | 'stat-length'
  | 'stat-strand'
  | 'chart-featuretype'
  | 'chart-chromosome'
  | 'chart-histogram'
  | 'chart-strand'
  | 'chart-coverage'

export type DataKey = 'featureTypes' | 'chromosomes' | 'strandData' | 'coverage' | 'lengthHistogram'
export type ChartType = 'vertical-bar' | 'horizontal-bar' | 'pie' | 'area' | 'histogram'

export interface AIWidget {
  id: string
  title: string
  dataKey: DataKey
  chartType: ChartType
}

interface DashboardStore {
  hidden: PanelKey[]
  aiWidgets: AIWidget[]
  customizing: boolean

  isHidden: (key: PanelKey) => boolean
  toggleHidden: (key: PanelKey) => void
  resetLayout: () => void
  addAIWidget: (widget: Omit<AIWidget, 'id'>) => void
  removeAIWidget: (id: string) => void
  setCustomizing: (v: boolean) => void
}

const STORAGE_KEY = 'genomic-dashboard-state'

function loadState(): Pick<DashboardStore, 'hidden' | 'aiWidgets'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { hidden: [], aiWidgets: [] }
    const parsed = JSON.parse(raw)
    return { hidden: parsed.hidden ?? [], aiWidgets: parsed.aiWidgets ?? [] }
  } catch {
    return { hidden: [], aiWidgets: [] }
  }
}

function saveState(hidden: PanelKey[], aiWidgets: AIWidget[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ hidden, aiWidgets }))
  } catch {
    // ignore
  }
}

const initial = loadState()

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  hidden: initial.hidden,
  aiWidgets: initial.aiWidgets,
  customizing: false,

  isHidden: (key) => get().hidden.includes(key),

  toggleHidden: (key) =>
    set((s) => {
      const hidden = s.hidden.includes(key)
        ? s.hidden.filter((k) => k !== key)
        : [...s.hidden, key]
      saveState(hidden, s.aiWidgets)
      return { hidden }
    }),

  resetLayout: () =>
    set((s) => {
      saveState([], s.aiWidgets)
      return { hidden: [], customizing: false }
    }),

  addAIWidget: (widget) =>
    set((s) => {
      const aiWidgets = [
        ...s.aiWidgets,
        { ...widget, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
      ]
      saveState(s.hidden, aiWidgets)
      return { aiWidgets }
    }),

  removeAIWidget: (id) =>
    set((s) => {
      const aiWidgets = s.aiWidgets.filter((w) => w.id !== id)
      saveState(s.hidden, aiWidgets)
      return { aiWidgets }
    }),

  setCustomizing: (customizing) => set({ customizing }),
}))
