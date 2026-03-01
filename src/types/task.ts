import { parseISO, startOfDay, isValid, isBefore, isSameDay } from 'date-fns'
import { z } from 'zod'

type IsoDateString = string

export const roles = ['nurse', 'dietician', 'social_worker'] as const
export type Role = (typeof roles)[number]

export const taskStatuses = ['pending', 'in_progress', 'completed'] as const
export type TaskStatus = (typeof taskStatuses)[number]

export type TimeFilter = 'all' | 'overdue' | 'due-today' | 'upcoming'

export const roleLabels: Record<Role, string> = {
    nurse: 'Nurse',
    dietician: 'Dietician',
    social_worker: 'Social Worker',
}

export const statusLabels: Record<TaskStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
}

export interface Task {
    id: string
    patientId: string
    patientName: string
    patientAge?: number
    patientRoom?: string
    title: string
    role: Role
    status: TaskStatus
    dueDate: IsoDateString
    updatedAt?: IsoDateString
    notes?: string
}

export interface NewTaskPayload {
    patientId: string
    patientName: string
    patientAge?: number
    patientRoom?: string
    title: string
    role: Role
    dueDate: IsoDateString
    notes?: string
}

export interface UpdateTaskStatusPayload {
    taskId: string
    status: TaskStatus
}

export const TaskSchema = z
    .object({
        id: z.string(),
        patientId: z.string(),
        patientName: z.string().default('Unknown patient'),
        patientAge: z.number().int().min(0).max(120).optional(),
        patientRoom: z.string().optional(),
        title: z.string(),
        role: z.enum(roles),
        status: z.enum(taskStatuses),
        dueDate: z.string(),
        updatedAt: z.string().optional(),
        notes: z.string().optional(),
    })
    .transform((raw) => ({
        ...raw,
        patientName: raw.patientName || 'Unknown patient',
    }))

export const TaskListSchema = z.array(TaskSchema)
export type TaskResponse = z.infer<typeof TaskSchema>

export function computeTimeBucket(dueDate: IsoDateString, now = new Date()): TimeFilter {
    const parsed = parseISO(dueDate)
    if (!isValid(parsed)) return 'upcoming'
    const today = startOfDay(now)
    if (isBefore(parsed, today)) return 'overdue'
    if (isSameDay(parsed, now)) return 'due-today'
    return 'upcoming'
}

export function isTaskMatchingTimeFilter(task: Task, filter: TimeFilter): boolean {
    if (filter === 'all') return true
    if (task.status === 'completed') return false
    const bucket = computeTimeBucket(task.dueDate)
    return bucket === filter
}
