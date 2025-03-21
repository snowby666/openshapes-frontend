import axios from 'axios'
import { getCookie } from 'cookies-next'

// Create API client
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth interceptor to include token in requests
apiClient.interceptors.request.use((config) => {
  const token = getCookie('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Bot interfaces
export interface Bot {
  id: string
  name: string
  description?: string
  owner_id: string
  status: string
  container_id?: string
  created_at: string
  config?: Record<string, unknown>
}

export interface BotCreate {
  name: string
  description?: string
  bot_token: string
  config: Record<string, unknown>
  brain_data?: Record<string, unknown>
}

export interface BotUpdate {
  name?: string
  description?: string
  config?: Record<string, unknown>
}

export interface APISettings {
  base_url?: string
  api_key?: string
  chat_model?: string
  tts_model?: string
  tts_voice?: string
}

// Bot service
export const botService = {
  // Get all bots for the current user
  async getUserBots(): Promise<Bot[]> {
    const response = await apiClient.get('/api/bots')
    return response.data.bots
  },

  // Get a specific bot by ID
  async getBot(botId: string): Promise<Bot> {
    const response = await apiClient.get(`/api/bots/${botId}`)
    return response.data
  },

  // Create a new bot
  async createBot(botData: BotCreate): Promise<{ id: string, message: string }> {
    const response = await apiClient.post('/api/bots', botData)
    return response.data
  },

  // Update a bot
  async updateBot(botId: string, updateData: BotUpdate): Promise<{ message: string }> {
    const response = await apiClient.put(`/api/bots/${botId}`, updateData)
    return response.data
  },

  // Delete a bot
  async deleteBot(botId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/api/bots/${botId}`)
    return response.data
  },

  // Start a bot
  async startBot(botId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/api/bots/${botId}/start`)
    return response.data
  },

  // Stop a bot
  async stopBot(botId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/api/bots/${botId}/stop`)
    return response.data
  },

  // Restart a bot
  async restartBot(botId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/api/bots/${botId}/restart`)
    return response.data
  },

  // Get bot logs
  async getBotLogs(botId: string, lines: number = 50): Promise<{ logs: string }> {
    const response = await apiClient.get(`/api/bots/${botId}/logs?lines=${lines}`)
    return response.data
  },

  // Get bot stats
  async getBotStats(botId: string): Promise<{ stats: Record<string, unknown> }> {
    const response = await apiClient.get(`/api/bots/${botId}/stats`)
    return response.data
  },

  // Update API settings
  async updateAPISettings(botId: string, settings: APISettings): Promise<{ message: string }> {
    const response = await apiClient.put(`/api/bots/${botId}/api-settings`, settings)
    return response.data
  },
}

// User interfaces
export interface User {
  id: string
  username: string
  discriminator?: string
  avatar?: string
  bot_credits: number
  is_admin: boolean
}

// User service
export const userService = {
  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/api/user')
    return response.data
  },
}

// Admin interfaces
export interface AdminStats {
  docker: {
    version: string
    containers: number
    running_containers: number
    images: number
  }
  system: {
    os: string
    architecture: string
    cpus: number
    cpu_usage: number
    memory: {
      percent: number
      used_gb: number
      total_gb: number
    }
    disk: {
      percent: number
      used_gb: number
      total_gb: number
    }
  }
  app: {
    user_count: number
    bot_count: number
    data_directory: string
  }
}

// Admin service
export const adminService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get('/api/admin/users')
    return response.data.users
  },

  // Get all bots
  async getAllBots(): Promise<Bot[]> {
    const response = await apiClient.get('/api/admin/bots')
    return response.data.bots
  },

  // Add credits to a user
  async addUserCredits(userId: string, credits: number = 1): Promise<{ message: string }> {
    const response = await apiClient.post(`/api/admin/users/${userId}/credits?credits=${credits}`)
    return response.data
  },

  // Set admin status for a user
  async setAdminStatus(userId: string, isAdmin: boolean): Promise<{ message: string }> {
    const response = await apiClient.post(`/api/admin/users/${userId}/admin?is_admin=${isAdmin}`)
    return response.data
  },

  // Get system stats
  async getSystemStats(): Promise<AdminStats> {
    const response = await apiClient.get('/api/admin/stats')
    return response.data
  },
}

// Named export for services
const services = { botService, userService, adminService }
export default services