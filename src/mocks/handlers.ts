import { http, HttpResponse, delay } from 'msw'
import type { NewTaskPayload, TaskStatus, UpdateTaskStatusPayload } from '../types/task'
import { tasks } from './data'

function mutateTasks(updater: () => void) {
    updater()
}

export const handlers = [
    http.get('/api/tasks', async () => {
        await delay(150)
        return HttpResponse.json(tasks)
    }),

    http.post('/api/tasks', async ({ request }) => {
        const body = (await request.json()) as NewTaskPayload
        const dueDate = new Date(body.dueDate).toISOString()
        const newTask = {
            ...body,
            id: crypto.randomUUID(),
            status: 'pending' as TaskStatus,
            updatedAt: new Date().toISOString(),
            dueDate,
        }
        mutateTasks(() => tasks.unshift(newTask))
        await delay(200)
        return HttpResponse.json(newTask)
    }),

    http.patch('/api/tasks/:id', async ({ params, request }) => {
        const { id } = params
        const body = (await request.json()) as UpdateTaskStatusPayload
        await delay(150)

        const taskIndex = tasks.findIndex((task) => task.id === id)
        if (taskIndex === -1) {
            return HttpResponse.json({ message: 'Task not found' }, { status: 404 })
        }

        const updated = { ...tasks[taskIndex], status: body.status, updatedAt: new Date().toISOString() }
        mutateTasks(() => {
            tasks[taskIndex] = updated
        })
        return HttpResponse.json(updated)
    }),
]
