import { create } from 'zustand'

interface UiState {
  sidebarCollapsed: boolean
  paletteOpen: boolean
  toggleSidebar: () => void
  setPaletteOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarCollapsed: false,
  paletteOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setPaletteOpen: (open) => set({ paletteOpen: open }),
}))
