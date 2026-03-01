import { get, patch, post } from './http'
import {
    type NewTaskPayload,
    type Task,
    type TaskResponse,
    type UpdateTaskStatusPayload,
    TaskSchema,
    TaskListSchema,
} from '../types/task'

const TASKS_PATH = '/tasks'

export async function fetchTasks(): Promise<Task[]> {
    const data = await get<TaskResponse[]>(TASKS_PATH)
    const parsed = TaskListSchema.safeParse(data)
    if (!parsed.success) {
        console.warn('Task payload validation failed', parsed.error)
        throw new Error('Task payload did not match contract')
    }
    return parsed.data
}

export async function createTask(payload: NewTaskPayload): Promise<Task> {
    const data = await post<TaskResponse>(TASKS_PATH, payload)
    const parsed = TaskSchema.safeParse(data)
    if (!parsed.success) {
        console.warn('Create task payload validation failed', parsed.error)
        throw new Error('Create task response invalid')
    }
    return parsed.data
}

export async function updateTaskStatus(payload: UpdateTaskStatusPayload): Promise<Task> {
    const data = await patch<TaskResponse>(`${TASKS_PATH}/${payload.taskId}`, payload)
    const parsed = TaskSchema.safeParse(data)
    if (!parsed.success) {
        console.warn('Update task payload validation failed', parsed.error)
        throw new Error('Update task response invalid')
    }
    return parsed.data
}
