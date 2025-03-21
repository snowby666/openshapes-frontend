import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../context/AuthContext'
import { botService, Bot, APISettings } from '../../services/api'
import Link from 'next/link'

// Tab interface
type TabType = 'overview' | 'settings' | 'logs' | 'api'
type ErrorType = string | Error | unknown;

const BotDetailPage = () => {
  const router = useRouter()
  const { id } = router.query
  const { user, loading } = useAuth()
  
  // Bot data state
  const [bot, setBot] = useState<Bot | null>(null)
  const [botLoading, setBotLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [logs, setLogs] = useState<string>('')
  const [logsLoading, setLogsLoading] = useState(false)
  
  // API Settings form state
  const [baseUrl, setBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [chatModel, setChatModel] = useState('')
  const [ttsModel, setTtsModel] = useState('')
  const [ttsVoice, setTtsVoice] = useState('')
  const [submittingApi, setSubmittingApi] = useState(false)
  
  // Load bot data when component mounts
  useEffect(() => {
    const fetchBotData = async () => {
      if (!id || typeof id !== 'string') return
      
      setBotLoading(true)
      setError(null)
      
      try {
        const botData = await botService.getBot(id)
        setBot(botData)
        
        // Initialize API settings form with current values
        if (botData.config?.api_settings) {
          setBaseUrl(botData.config.api_settings.base_url || '')
          setApiKey(botData.config.api_settings.api_key || '')
          setChatModel(botData.config.api_settings.chat_model || '')
          setTtsModel(botData.config.api_settings.tts_model || '')
          setTtsVoice(botData.config.api_settings.tts_voice || '')
        }
      } catch (error) {
        console.error('Error fetching bot:', error)
        setError(getErrorMessage(error))
      } finally {
        setBotLoading(false)
      }
    }
    
    if (!loading && user) {
      fetchBotData()
    } else if (!loading && !user) {
      router.push('/')
    }
  }, [id, user, loading, router])
  
  // Helper function to extract error message
  const getErrorMessage = (error: ErrorType): string => {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'An unknown error occurred'
  }
  
  // Check for creation success message
  useEffect(() => {
    if (router.query.created === 'true') {
      setSuccessMessage('Bot created successfully!')
    }
  }, [router.query])
  
  // Handle bot actions (start, stop, restart)
  const handleBotAction = async (action: 'start' | 'stop' | 'restart') => {
    if (!bot) return
    
    try {
      setError(null)
      
      if (action === 'start') {
        await botService.startBot(bot.id)
      } else if (action === 'stop') {
        await botService.stopBot(bot.id)
      } else if (action === 'restart') {
        await botService.restartBot(bot.id)
      }
      
      setSuccessMessage(`Bot ${action}ed successfully`)
      
      // Refresh bot data after action
      const updatedBot = await botService.getBot(bot.id)
      setBot(updatedBot)
    } catch (error) {
      console.error(`Error ${action}ing bot:`, error)
      setError(getErrorMessage(error))
    }
  }
  
  // Handle bot deletion
  const handleDeleteBot = async () => {
    if (!bot) return
    
    if (window.confirm('Are you sure you want to delete this bot? This action cannot be undone.')) {
      try {
        await botService.deleteBot(bot.id)
        router.push('/dashboard?deleted=true')
      } catch (error) {
        console.error('Error deleting bot:', error)
        setError(getErrorMessage(error))
      }
    }
  }
  
  // Handle getting bot logs
  const fetchLogs = async () => {
    if (!bot) return
    
    setLogsLoading(true)
    try {
      const response = await botService.getBotLogs(bot.id, 100) // Get last 100 lines
      setLogs(response.logs)
    } catch (error) {
      console.error('Error fetching logs:', error)
      setError(getErrorMessage(error))
    } finally {
      setLogsLoading(false)
    }
  }
  
  // Handle API settings update
  const handleApiSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bot) return
    
    setSubmittingApi(true)
    setError(null)
    
    try {
      const apiSettings: APISettings = {
        base_url: baseUrl || undefined,
        api_key: apiKey || undefined,
        chat_model: chatModel || undefined,
        tts_model: ttsModel || undefined,
        tts_voice: ttsVoice || undefined
      }
      
      await botService.updateAPISettings(bot.id, apiSettings)
      setSuccessMessage('API settings updated successfully')
      
      // Refresh bot data
      const updatedBot = await botService.getBot(bot.id)
      setBot(updatedBot)
    } catch (error) {
      console.error('Error updating API settings:', error)
      setError(getErrorMessage(error))
    } finally {
      setSubmittingApi(false)
    }
  }
  
  // Loading state
  if (loading || botLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  
  if (!bot) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                &larr; Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold">Bot Not Found</h1>
            </div>
            <p>The bot you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                &larr; Back
              </Link>
              <h1 className="text-3xl font-bold flex-grow">{bot.name}</h1>
              <span 
                className={`px-3 py-1 rounded-full ${
                  bot.status === 'running' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {bot.status}
              </span>
            </div>
            {bot.description && (
              <p className="text-gray-600 mt-2">{bot.description}</p>
            )}
          </div>
          
          {/* Success message */}
          {successMessage && (
            <div className="m-6 p-4 bg-green-100 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="m-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="p-6 border-b border-gray-200 flex flex-wrap gap-3">
            {bot.status === 'running' ? (
              <button
                onClick={() => handleBotAction('stop')}
                className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
              >
                Stop Bot
              </button>
            ) : (
              <button
                onClick={() => handleBotAction('start')}
                className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
              >
                Start Bot
              </button>
            )}
            
            <button
              onClick={() => handleBotAction('restart')}
              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
            >
              Restart Bot
            </button>
            
            <button
              onClick={handleDeleteBot}
              className="px-4 py-2 bg-gray-600 text-white rounded shadow hover:bg-gray-700 ml-auto"
            >
              Delete Bot
            </button>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`px-6 py-3 ${
                  activeTab === 'api'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                API Settings
              </button>
              <button
                onClick={() => {
                  setActiveTab('logs')
                  fetchLogs()
                }}
                className={`px-6 py-3 ${
                  activeTab === 'logs'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Logs
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-3 ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Advanced Settings
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          <div className="p-6">
            {/* Overview tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Bot Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Basic Details</h3>
                    <ul className="space-y-2">
                      <li><strong>Name:</strong> {bot.name}</li>
                      <li><strong>Status:</strong> {bot.status}</li>
                      <li><strong>ID:</strong> {bot.id}</li>
                      <li><strong>Created:</strong> {new Date(bot.created_at).toLocaleString()}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Character Details</h3>
                    <ul className="space-y-2">
                      <li><strong>Character Name:</strong> {bot.config?.character_name || bot.name}</li>
                      {bot.config?.personality_traits && (
                        <li><strong>Personality:</strong> {bot.config.personality_traits}</li>
                      )}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-2">Discord Integration</h3>
                  <p className="mb-4">
                    To add this bot to a Discord server, use the following invite link:
                  </p>
                  <div className="bg-gray-100 p-4 rounded mb-4 break-all">
                    <code>
                      https://discord.com/api/oauth2/authorize?client_id=BOT_CLIENT_ID&permissions=8&scope=bot%20applications.commands
                    </code>
                  </div>
                  <p className="text-sm text-gray-600">
                    Replace BOT_CLIENT_ID with your Discord application client ID.
                  </p>
                </div>
              </div>
            )}
            
            {/* API Settings tab */}
            {activeTab === 'api' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">API Settings</h2>
                <p className="mb-6">
                  Configure the AI API provider for your bot. These settings determine which AI service your bot will use for generating responses.
                </p>
                
                <form onSubmit={handleApiSubmit}>
                  <div className="mb-4">
                    <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      API Base URL
                    </label>
                    <input
                      type="text"
                      id="baseUrl"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://api.openai.com/v1"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      id="apiKey"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="sk-..."
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="chatModel" className="block text-sm font-medium text-gray-700 mb-1">
                      Chat Model
                    </label>
                    <input
                      type="text"
                      id="chatModel"
                      value={chatModel}
                      onChange={(e) => setChatModel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="gpt-3.5-turbo"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="ttsModel" className="block text-sm font-medium text-gray-700 mb-1">
                      TTS Model
                    </label>
                    <input
                      type="text"
                      id="ttsModel"
                      value={ttsModel}
                      onChange={(e) => setTtsModel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="tts-1"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="ttsVoice" className="block text-sm font-medium text-gray-700 mb-1">
                      TTS Voice
                    </label>
                    <input
                      type="text"
                      id="ttsVoice"
                      value={ttsVoice}
                      onChange={(e) => setTtsVoice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="alloy"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingApi}
                      className={`px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition ${
                        submittingApi ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {submittingApi ? 'Saving...' : 'Save API Settings'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Logs tab */}
            {activeTab === 'logs' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Bot Logs</h2>
                  <button
                    onClick={fetchLogs}
                    disabled={logsLoading}
                    className={`px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition ${
                      logsLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {logsLoading ? 'Loading...' : 'Refresh Logs'}
                  </button>
                </div>
                
                <div className="bg-gray-900 text-gray-200 p-4 rounded font-mono text-sm h-[500px] overflow-auto">
                  {logsLoading ? (
                    <div className="flex justify-center items-center h-full">Loading logs...</div>
                  ) : logs ? (
                    <pre className="whitespace-pre-wrap">{logs}</pre>
                  ) : (
                    <div className="flex justify-center items-center h-full">No logs available</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Advanced Settings tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Advanced Settings</h2>
                <p className="mb-6 text-gray-600">
                  Advanced settings are currently not available through the web interface. To modify advanced configuration, you&apos;ll need to update the config.json file directly.
                </p>
                
                <div className="bg-yellow-50 p-4 rounded mb-6">
                  <h3 className="font-semibold text-yellow-800 mb-2">Warning</h3>
                  <p className="text-yellow-700">
                    Modifying advanced settings may affect your bot&apos;s behavior or cause it to stop working. Proceed with caution.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-100 rounded">
                  <h3 className="font-medium mb-2">Current Configuration</h3>
                  <pre className="text-xs overflow-auto max-h-[400px] p-2 bg-gray-800 text-gray-200 rounded">
                    {JSON.stringify(bot.config, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BotDetailPage