import { describe, expect, it, afterEach } from 'vitest'
import { useFilterStore } from './filterStore'

afterEach(() => {
    useFilterStore.setState({ role: 'all', time: 'all' })
})

describe('filter store', () => {
    it('has sensible defaults', () => {
        const state = useFilterStore.getState()
        expect(state.role).toBe('all')
        expect(state.time).toBe('all')
    })

    it('updates role and time independently', () => {
        const { setRole, setTime } = useFilterStore.getState()
        setRole('nurse')
        setTime('overdue')

        const state = useFilterStore.getState()
        expect(state.role).toBe('nurse')
        expect(state.time).toBe('overdue')
    })
})
