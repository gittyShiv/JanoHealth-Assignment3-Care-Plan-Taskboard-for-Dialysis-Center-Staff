import type { Task, TaskStatus } from '../types/task'
import { statusLabels, taskStatuses } from '../types/task'
import { groupTasksByPatient } from '../utils/taskGrouping'
import { TaskCard } from './TaskCard'

interface TaskBoardProps {
    tasks: Task[]
    isLoading: boolean
    isError: boolean
    onRetry: () => void
    busyIds?: Set<string>
    onStatusChange: (taskId: string, status: TaskStatus) => void
    readOnly?: boolean
    manageLink?: string
}

export function TaskBoard({ tasks, isLoading, isError, onRetry, busyIds, onStatusChange, readOnly, manageLink }: TaskBoardProps) {
    if (isLoading) {
        return <div className="panel">Loading tasks...</div>
    }

    if (isError) {
        return (
            <div className="panel error">
                <div>Unable to load tasks.</div>
                <button type="button" onClick={onRetry}>
                    Retry
                </button>
            </div>
        )
    }

    if (!tasks.length) {
        return <div className="panel">No tasks match the filters.</div>
    }

    const grouped = groupTasksByPatient(tasks)

    return (
        <div className="taskboard">
            <div className="taskboard__columns">
                <div className="taskboard__header">Patient</div>
                {taskStatuses.map((status) => (
                    <div key={status} className="taskboard__header">
                        {statusLabels[status]}
                    </div>
                ))}
            </div>

            {grouped.map((group) => (
                <div key={group.patientId} className="taskboard__row">
                    <div className="patient-cell">
                        <div className="patient-name">{group.patientName}</div>
                        <div className="patient-id">{group.patientId}</div>
                        <div className="patient-meta">
                            {group.patientAge ? `${group.patientAge} yrs` : 'Age n/a'} ·{' '}
                            {group.patientRoom ?? 'Room n/a'}
                        </div>
                    </div>

                    {taskStatuses.map((status) => {
                        const statusTasks = group.tasksByStatus[status]
                        return (
                            <div key={status} className="task-cell">
                                {statusTasks.length === 0 && <div className="empty">–</div>}
                                {statusTasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        isUpdating={busyIds?.has(task.id)}
                                        readOnly={readOnly}
                                        manageLink={manageLink}
                                        onStatusChange={(next) => onStatusChange(task.id, next)}
                                    />
                                ))}
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}
