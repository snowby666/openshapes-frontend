import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { botService, Bot } from '../services/api'
import Link from 'next/link'

const Dashboard = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bots, setBots] = useState<Bot[]>([])
  const [botLoading, setBotLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch bots when user is authenticated
  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.push('/')
      return
    }

    if (user) {
      // Fetch user's bots
      const fetchBots = async () => {
        setBotLoading(true)
        try {
          const userBots = await botService.getUserBots()
          setBots(userBots)
        } catch (err) {
          console.error('Error fetching bots:', err)
          setError('Failed to load your bots')
        } finally {
          setBotLoading(false)
        }
      }

      fetchBots()
    }
  }, [user, loading, router])

  // Handle bot actions (start, stop, restart)
  const handleBotAction = async (botId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      if (action === 'start') {
        await botService.startBot(botId)
      } else if (action === 'stop') {
        await botService.stopBot(botId)
      } else if (action === 'restart') {
        await botService.restartBot(botId)
      }

      // Refresh bot list
      const updatedBots = await botService.getUserBots()
      setBots(updatedBots)
    } catch (err: unknown) {
      console.error(`Error ${action} bot:`, err)
      setError(`Failed to ${action} bot: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Handle bot deletion
  const handleDeleteBot = async (botId: string) => {
    if (window.confirm('Are you sure you want to delete this bot? This action cannot be undone.')) {
      try {
        await botService.deleteBot(botId)
        // Remove the deleted bot from the list
        setBots(bots.filter(bot => bot.id !== botId))
      } catch (err: unknown) {
        console.error('Error deleting bot:', err)
        setError(`Failed to delete bot: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
  }

  // Loading state
  if (loading || (user && botLoading)) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  // Render dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Bots</h1>
          <Link 
            href="/bots/create" 
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          >
            Create New Bot
          </Link>
        </div>

        {/* Credits display */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <p className="text-lg">
            Credits available: <span className="font-bold">{user?.bot_credits || 0}</span>
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Bot list */}
        {bots.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-xl mb-4">You don&apos;t have any bots yet.</p>
            <Link 
              href="/bots/create" 
              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
            >
              Create Your First Bot
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map(bot => (
              <div key={bot.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold mb-2">{bot.name}</h2>
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${
                        bot.status === 'running' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {bot.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{bot.description || 'No description'}</p>
                </div>
                
                <div className="border-t border-gray-200 p-4 bg-gray-50 flex flex-wrap justify-between gap-2">
                  {/* Bot actions */}
                  <div className="flex gap-2">
                    {bot.status === 'running' ? (
                      <button
                        onClick={() => handleBotAction(bot.id, 'stop')}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Stop
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBotAction(bot.id, 'start')}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Start
                      </button>
                    )}
                    <button
                      onClick={() => handleBotAction(bot.id, 'restart')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Restart
                    </button>
                  </div>
                  
                  {/* Management links */}
                  <div className="flex gap-2">
                    <Link
                      href={`/bots/${bot.id}`}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Manage
                    </Link>
                    <button
                      onClick={() => handleDeleteBot(bot.id)}
                      className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard