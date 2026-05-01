import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

// Fixed QueryClient config — prevents refetch storms and freeze
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 min — prevents refetch storms
      gcTime: 30 * 60 * 1000,          // 30 min cache retention
      refetchOnWindowFocus: false,      // CRITICAL: was causing refetch storm on tab switch
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        // Never retry auth errors
        if (error?.response?.status === 401) return false
        if (error?.response?.status === 403) return false
        if (error?.response?.status === 404) return false
        return failureCount < 2
      },
      retryDelay: (i) => Math.min(1000 * 2 ** i, 10000),
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 0,
      networkMode: 'offlineFirst',
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e1e35',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#00f5d4', secondary: '#1e1e35' },
              duration: 2000,
            },
            error: {
              iconTheme: { primary: '#f56565', secondary: '#1e1e35' },
              duration: 4000,
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
