import { create } from 'zustand'
import type { Role, TimeFilter } from '../types/task'

interface FilterState {
    role: Role | 'all'
    time: TimeFilter
    setRole: (role: FilterState['role']) => void
    setTime: (time: TimeFilter) => void
}

export const useFilterStore = create<FilterState>((set) => ({
    role: 'all',
    time: 'all',
    setRole: (role) => set({ role }),
    setTime: (time) => set({ time }),
}))
