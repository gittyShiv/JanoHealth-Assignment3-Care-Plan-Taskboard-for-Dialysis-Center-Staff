import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import type { Task, TaskStatus } from '../types/task'
import { computeTimeBucket, roleLabels, statusLabels } from '../types/task'

interface TaskCardProps {
    task: Task
    onStatusChange: (status: TaskStatus) => void
    isUpdating?: boolean
    readOnly?: boolean
    manageLink?: string
}

function dueLabel(task: Task) {
    const bucket = computeTimeBucket(task.dueDate)
    if (bucket === 'overdue') return 'Overdue'
    if (bucket === 'due-today') return 'Due today'
    return `Due ${format(new Date(task.dueDate), 'MMM d')}`
}

function statusActions(task: Task): TaskStatus[] {
    if (task.status === 'pending') return ['in_progress', 'completed']
    if (task.status === 'in_progress') return ['completed']
    return []
}

export function TaskCard({ task, onStatusChange, isUpdating, readOnly, manageLink }: TaskCardProps) {
    const bucket = computeTimeBucket(task.dueDate)
    const actions = statusActions(task)

    return (
        <article className={`task-card status-${task.status}`} data-bucket={bucket}>
            <header className="task-card__header">
                <span className="pill role">{roleLabels[task.role]}</span>
                <span className={`pill bucket bucket-${bucket}`}>{dueLabel(task)}</span>
            </header>

            <div className="task-card__body">
                <p className="task-title">{task.title}</p>
                <p className="task-meta">{statusLabels[task.status]}</p>
            </div>

            <div className="task-card__footer">
                {readOnly ? (
                    manageLink ? (
                        <Link className="ghost-button" to={manageLink}>
                            Manage
                        </Link>
                    ) : (
                        <span className="pill muted">Managed elsewhere</span>
                    )
                ) : (
                    <>
                        {actions.length === 0 && <span className="pill muted">No actions</span>}
                        {actions.map((status) => (
                            <button
                                key={status}
                                type="button"
                                disabled={isUpdating}
                                onClick={() => onStatusChange(status)}
                                className="ghost-button"
                            >
                                {status === 'in_progress' ? 'Start' : 'Mark completed'}
                            </button>
                        ))}
                    </>
                )}
            </div>
        </article>
    )
}
