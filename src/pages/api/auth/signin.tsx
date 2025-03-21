import { GetServerSideProps } from 'next'
import { getProviders, signIn, getCsrfToken } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

// Types for props
interface SignInProps {
  providers: Record<string, {
    id: string
    name: string
    type: string
    signinUrl: string
    callbackUrl: string
  }>
  csrfToken: string
}

export default function SignIn({ providers, csrfToken }: SignInProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-900 to-gray-800 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">OpenShapes</h1>
        <p className="text-gray-300 text-xl">Sign in to manage your AI character bots</p>
      </div>
      
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign In</h2>
          
          {Object.values(providers).map((provider) => (
            <div key={provider.id} className="mb-4">
              <button
                onClick={() => signIn(provider.id, { callbackUrl: '/dashboard' })}
                className={`w-full flex items-center justify-center gap-3 px-4 py-3 text-white font-medium rounded-lg transition-colors ${
                  provider.id === 'discord' 
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {provider.id === 'discord' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                )}
                Sign in with {provider.name}
              </button>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 px-6 py-4 sm:px-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>OpenShapes is an open-source project.</p>
        <p className="mt-1">
          <a 
            href="https://github.com/zukijourney/openshapes" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            View on GitHub
          </a>
        </p>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const providers = await getProviders()
  const csrfToken = await getCsrfToken(context)
  
  return {
    props: {
      providers: providers || {},
      csrfToken: csrfToken || ''
    },
  }
}