import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTask, fetchTasks, updateTaskStatus } from '../api/tasks'
import type { NewTaskPayload, Task, UpdateTaskStatusPayload } from '../types/task'
import { isTaskMatchingTimeFilter } from '../types/task'
import { useFilterStore } from '../state/filterStore'

const TASKS_KEY = ['tasks'] as const

export function useTasksQuery() {
    return useQuery({
        queryKey: TASKS_KEY,
        queryFn: fetchTasks,
    })
}

export function useFilteredTasks() {
    const { role, time } = useFilterStore()
    const query = useTasksQuery()
    const tasks = (query.data || []).filter((task) => {
        const matchesRole = role === 'all' || task.role === role
        const matchesTime = isTaskMatchingTimeFilter(task, time)
        return matchesRole && matchesTime
    })

    return { ...query, tasks }
}

export function useCreateTaskMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createTask,
        onMutate: async (payload: NewTaskPayload) => {
            await queryClient.cancelQueries({ queryKey: TASKS_KEY })
            const previous = queryClient.getQueryData<Task[]>(TASKS_KEY)
            const optimistic: Task = {
                id: `temp-${Date.now()}`,
                status: 'pending',
                updatedAt: new Date().toISOString(),
                ...payload,
            }
            if (previous) {
                queryClient.setQueryData(TASKS_KEY, [optimistic, ...previous])
            }
            return { previous }
        },
        onError: (_error, _variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(TASKS_KEY, context.previous)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_KEY })
        },
    })
}

export function useUpdateTaskStatusMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: UpdateTaskStatusPayload) => updateTaskStatus(payload),
        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey: TASKS_KEY })
            const previous = queryClient.getQueryData<Task[]>(TASKS_KEY)
            if (previous) {
                queryClient.setQueryData<Task[]>(TASKS_KEY, () =>
                    previous.map((task) =>
                        task.id === payload.taskId
                            ? {
                                ...task,
                                status: payload.status,
                                updatedAt: new Date().toISOString(),
                            }
                            : task,
                    ),
                )
            }
            return { previous }
        },
        onError: (_error, _variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(TASKS_KEY, context.previous)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_KEY })
        },
    })
}
