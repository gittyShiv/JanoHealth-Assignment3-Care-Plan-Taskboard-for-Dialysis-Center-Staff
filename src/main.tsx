import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { createQueryClient } from './lib/queryClient'

const queryClient = createQueryClient()

async function enableMocking() {
  if (typeof window === 'undefined') return

  const { worker } = await import('./mocks/browser')

  await worker.start({
    serviceWorker: {
      url: '/mockServiceWorker.js',
      options: { scope: '/' },
    },
    onUnhandledRequest: 'bypass',
  })

  console.log('MSW started')
}

async function bootstrap() {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element missing')
  }

  await enableMocking()

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  )
}

bootstrap()