import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, test } from 'vitest'
import App from '../App'
import { createQueryClient } from '../lib/queryClient'
import { server } from '../mocks/server'

function renderApp() {
    const client = createQueryClient()
    return render(
        <QueryClientProvider client={client}>
            <App />
        </QueryClientProvider>,
    )
}

test('rolls back optimistic status update when server fails', async () => {
    server.use(
        http.patch('/api/tasks/:id', async () => HttpResponse.json({ message: 'boom' }, { status: 500 })),
    )

    renderApp()
    const user = userEvent.setup()
    const cardTitle = (await screen.findAllByText('Monthly labs'))[0]
    const card = cardTitle.closest('article')
    if (!card) throw new Error('Card not found')

    const completeButton = within(card).getByRole('button', { name: /Mark completed/i })
    await user.click(completeButton)

    await waitFor(() => expect(screen.getByText(/Failed to update task|Request failed/)).toBeVisible())
    const revertedCardTitle = (await screen.findAllByText('Monthly labs'))[0]
    const revertedCard = revertedCardTitle.closest('article')
    if (!revertedCard) throw new Error('Card not found after rollback')
    expect(within(revertedCard).getByText('Pending')).toBeInTheDocument()
})
