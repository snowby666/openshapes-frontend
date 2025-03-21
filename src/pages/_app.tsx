import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AuthProvider } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'
import Layout from '@/components/layout/Layout'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  const router = useRouter()
  
  // Pages that don't need the main layout
  const noLayoutPages = ['/auth/signin', '/auth/signout', '/auth/error']
  const isNoLayoutPage = noLayoutPages.includes(router.pathname)
  
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* Toast notifications */}
          <Toaster position="top-right" />
          
          {isNoLayoutPage ? (
            <Component {...pageProps} />
          ) : (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          )}
        </AuthProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}