import { useFilterStore } from '../state/filterStore'
import { roleLabels, roles, type TimeFilter } from '../types/task'

const timeFilters: { value: TimeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'due-today', label: 'Due today' },
    { value: 'upcoming', label: 'Upcoming' },
]

export function FilterBar() {
    const role = useFilterStore((state) => state.role)
    const time = useFilterStore((state) => state.time)
    const setRole = useFilterStore((state) => state.setRole)
    const setTime = useFilterStore((state) => state.setTime)

    return (
        <div className="filter-bar">
            <div className="filter">
                <label htmlFor="role-filter">Role</label>
                <select
                    id="role-filter"
                    value={role}
                    onChange={(event) => setRole(event.target.value as typeof role)}
                >
                    <option value="all">All roles</option>
                    {roles.map((roleValue) => (
                        <option key={roleValue} value={roleValue}>
                            {roleLabels[roleValue]}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter">
                <label htmlFor="time-filter">Time</label>
                <select
                    id="time-filter"
                    value={time}
                    onChange={(event) => setTime(event.target.value as TimeFilter)}
                >
                    {timeFilters.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}
