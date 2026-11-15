import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { queryClient } from './api/query-client.ts'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/*
        Without transitions, so the URL updates in step with typing: the
        Dashboard's search box is bound to the URL, and a controlled input
        updated inside a transition loses its cursor and keystrokes.
      */}
      <BrowserRouter useTransitions={false}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
