import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../mocks/server'
import { resetTasks } from '../mocks/data'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
    resetTasks()
    server.resetHandlers()
})
afterAll(() => server.close())
