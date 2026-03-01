const BASE_URL = '/api'

export interface HttpError extends Error {
    status?: number
}

async function parseJson(response: Response) {
    const text = await response.text()
    if (!text) return null
    try {
        return JSON.parse(text)
    } catch {
        return text
    }
}

async function handleResponse(response: Response) {
    const payload = await parseJson(response)
    if (!response.ok) {
        const error: HttpError = new Error(
            typeof payload === 'string' ? payload : 'Request failed',
        )
        error.status = response.status
        throw error
    }
    return payload
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
        ...init,
    })
    return handleResponse(response) as Promise<T>
}

export async function get<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' })
}

export async function post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
}
