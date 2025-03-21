import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const { user, loading, login } = useAuth()
  const router = useRouter()
  
  // If already authenticated, redirect to dashboard
  if (!loading && user) {
    router.push('/dashboard')
  }
  
  return (
    <>
      <Head>
        <title>OpenShapes - Open Source Discord AI Character Bots</title>
        <meta name="description" content="Create and manage AI character bots for Discord with OpenShapes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-white font-bold text-xl">OpenShapes</div>
            <div>
              <button
                onClick={login}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Sign In with Discord
              </button>
            </div>
          </div>
        </nav>
        
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-12 md:py-24">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Create AI Characters for Discord
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                OpenShapes is an open-source platform that lets you create and manage AI character bots for Discord. Take full control of your AI companions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={login}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Get Started
                </button>
                <Link 
                  href="https://github.com/zukijourney/openshapes" 
                  target="_blank"
                  className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  View on GitHub
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-80 w-full">
                {/* Placeholder for hero image */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-2xl flex items-center justify-center">
                  <svg 
                    className="h-40 w-40 text-white opacity-80" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="container mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="bg-indigo-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Full Ownership</h3>
              <p className="text-gray-300">Your characters, your data—no reliance on third-party platforms.</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="bg-indigo-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Customization</h3>
              <p className="text-gray-300">Tailor every detail of your AI character's behavior and responses.</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="bg-indigo-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Cost-Effective</h3>
              <p className="text-gray-300">Choose any AI model provider, including budget-friendly options.</p>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="container mx-auto px-6 py-12">
          <div className="bg-indigo-900 rounded-lg shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Ready to Create Your AI Character?</h2>
            <p className="text-xl text-indigo-200 mb-8 text-center">
              Get started today and bring your character ideas to life.
            </p>
            <div className="flex justify-center">
              <button
                onClick={login}
                className="bg-white text-indigo-900 hover:bg-indigo-100 font-medium py-3 px-8 rounded-lg transition-colors"
              >
                Sign In with Discord
              </button>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="container mx-auto px-6 py-8">
          <div className="border-t border-gray-700 pt-8">
            <p className="text-center text-gray-400">
              OpenShapes is an open-source project and not affiliated with shapes.inc. Built with ❤️ by the community.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}