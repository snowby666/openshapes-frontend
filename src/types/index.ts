import { Session } from 'next-auth'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user?: {
      id?: string
      name?: string
      email?: string
      image?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}

// Bot type
export interface Bot {
  id: string
  name: string
  description?: string
  owner_id: string
  status: string
  container_id?: string
  created_at: string
  config?: any
}

// User type
export interface User {
  id: string
  username: string
  discriminator?: string
  avatar?: string
  bot_credits: number
  is_admin: boolean
}

// API Settings
export interface APISettings {
  base_url?: string
  api_key?: string
  chat_model?: string
  tts_model?: string
  tts_voice?: string
}

// Bot creation
export interface BotCreate {
  name: string
  description?: string
  bot_token: string
  config: any
  brain_data?: any
}

// Bot update
export interface BotUpdate {
  name?: string
  description?: string
  config?: any
}

// Admin stats
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