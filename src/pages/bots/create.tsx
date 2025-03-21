import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../context/AuthContext'
import { botService, BotCreate } from '../../services/api'
import Link from 'next/link'

const CreateBot = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [botToken, setBotToken] = useState('')
  const [configFile, setConfigFile] = useState<File | null>(null)
  const [brainFile, setBrainFile] = useState<File | null>(null)
  
  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [configError, setConfigError] = useState<string | null>(null)
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    } else if (user && user.bot_credits <= 0) {
      // Redirect if no credits
      router.push('/dashboard?error=no_credits')
    }
  }, [user, loading, router])

  // Handle config file validation and reading
  const handleConfigFile = (file: File | null) => {
    setConfigFile(file)
    setConfigError(null)
    
    if (file) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setConfigError('Config file is too large (max 5MB)')
        return
      }
      
      // Validate file type
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setConfigError('Config file must be JSON format')
        return
      }
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!name || !botToken || !configFile) {
      setError('Please fill in all required fields')
      return
    }
    
    if (configError) {
      return
    }
    
    setSubmitting(true)
    
    try {
      // Read config file
      const configText = await configFile.text()
      let configData: Record<string, unknown>
      try {
        configData = JSON.parse(configText)
      } catch (_) {
        setError('Invalid JSON in config file')
        setSubmitting(false)
        return
      }
      
      // Read brain file if provided
      let brainData = null
      if (brainFile) {
        const brainText = await brainFile.text()
        try {
          brainData = JSON.parse(brainText)
        } catch (_) {
          setError('Invalid JSON in brain file')
          setSubmitting(false)
          return
        }
      }
      
      // Create bot data
      const botData: BotCreate = {
        name,
        description: description || undefined,
        bot_token: botToken,
        config: configData,
        brain_data: brainData
      }
      
      // Submit to API
      const result = await botService.createBot(botData)
      
      // Redirect to bot management page
      router.push(`/bots/${result.id}?created=true`)
    } catch (error) {
      console.error('Error creating bot:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create bot'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Create New Bot</h1>
          </div>
          
          {/* Credits info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p>
              Credits available: <span className="font-bold">{user?.bot_credits || 0}</span>
              <span className="text-sm text-gray-600 ml-2">
                (Creating a bot will use 1 credit)
              </span>
            </p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Bot Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="botToken" className="block text-sm font-medium text-gray-700 mb-1">
                Discord Bot Token *
              </label>
              <input
                type="password"
                id="botToken"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bot token from Discord Developer Portal"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                You can get this from the{' '}
                <a 
                  href="https://discord.com/developers/applications" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Discord Developer Portal
                </a>
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="configFile" className="block text-sm font-medium text-gray-700 mb-1">
                Configuration File (config.json) *
              </label>
              <input
                type="file"
                id="configFile"
                onChange={(e) => handleConfigFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                accept=".json,application/json"
                required
              />
              {configError && (
                <p className="mt-1 text-sm text-red-600">{configError}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Upload your config.json file (Max size: 5MB)
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="brainFile" className="block text-sm font-medium text-gray-700 mb-1">
                Brain File (brain.json) (optional)
              </label>
              <input
                type="file"
                id="brainFile"
                onChange={(e) => setBrainFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                accept=".json,application/json"
              />
              <p className="mt-1 text-sm text-gray-500">
                If you have a brain.json file for your character, upload it here
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Creating...' : 'Create Bot'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateBot