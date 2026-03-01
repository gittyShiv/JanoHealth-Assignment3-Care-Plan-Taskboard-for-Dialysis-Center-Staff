import type { Task, TaskStatus } from '../types/task'

export interface PatientTaskGroup {
    patientId: string
    patientName: string
    patientAge?: number
    patientRoom?: string
    tasksByStatus: Record<TaskStatus, Task[]>
}

function sortByDueDate(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

export function groupTasksByPatient(tasks: Task[]): PatientTaskGroup[] {
    const groups = new Map<string, PatientTaskGroup>()

    tasks.forEach((task) => {
        const existing = groups.get(task.patientId)
        const tasksByStatus: Record<TaskStatus, Task[]> =
            existing?.tasksByStatus ||
            ({ pending: [], in_progress: [], completed: [] } as Record<TaskStatus, Task[]>)
        tasksByStatus[task.status] = [...tasksByStatus[task.status], task]

        groups.set(task.patientId, {
            patientId: task.patientId,
            patientName: task.patientName,
            patientAge: task.patientAge,
            patientRoom: task.patientRoom,
            tasksByStatus,
        })
    })

    return Array.from(groups.values()).map((group) => ({
        ...group,
        tasksByStatus: {
            pending: sortByDueDate(group.tasksByStatus.pending),
            in_progress: sortByDueDate(group.tasksByStatus.in_progress),
            completed: sortByDueDate(group.tasksByStatus.completed),
        },
    }))
}
