import React, { ReactNode, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import {
  HomeIcon,
  UserCircleIcon,
  CogIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Handle navigation items with active state
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: router.pathname === '/dashboard' },
    { name: 'My Bots', href: '/bots', icon: ChatBubbleLeftEllipsisIcon, current: router.pathname.startsWith('/bots') },
    { name: 'Settings', href: '/settings', icon: CogIcon, current: router.pathname === '/settings' },
  ]
  
  // If loading, show a simple loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  // If not authenticated and not on the home page, redirect to home
  if (!user && router.pathname !== '/') {
    router.push('/')
    return null
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 overflow-y-auto transition duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <span className="text-white text-xl font-semibold">OpenShapes</span>
          </div>
          <button
            type="button"
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                item.current
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-4 h-6 w-6 ${
                  item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
        
        {user && (
          <div className="absolute bottom-0 w-full border-t border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user.avatar ? (
                  <Image
                    className="h-10 w-10 rounded-full"
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                    alt={user.username}
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.username.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user.username}</p>
                <p className="text-xs font-medium text-gray-400">Credits: {user.bot_credits}</p>
              </div>
              <button
                onClick={logout}
                className="ml-auto text-gray-400 hover:text-white"
                title="Sign out"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-900 focus:outline-none"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
              <span className="ml-3 text-xl font-semibold">OpenShapes</span>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1">
          <div className="py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}