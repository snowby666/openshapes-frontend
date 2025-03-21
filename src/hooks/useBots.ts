import { useQuery, useMutation, useQueryClient } from 'react-query'
import { botService, BotCreate, BotUpdate, APISettings } from '@/services/api'
import { toast } from 'react-hot-toast'

export const useBots = () => {
  const queryClient = useQueryClient()
  
  // Get all user bots
  const { 
    data: bots, 
    isLoading: botsLoading, 
    error: botsError,
    refetch: refetchBots
  } = useQuery('bots', botService.getUserBots, {
    onError: (error) => {
      toast.error(error?.message || 'Failed to load bots')
    }
  })
  
  // Create a bot
  const createBotMutation = useMutation(
    (data: BotCreate) => botService.createBot(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bots')
        toast.success('Bot created successfully')
      },
      onError: (error) => {
        toast.error(error?.message || 'Failed to create bot')
      }
    }
  )
  
  // Update a bot
  const updateBotMutation = useMutation(
    ({ botId, data }: { botId: string; data: BotUpdate }) => 
      botService.updateBot(botId, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['bot', variables.botId])
        queryClient.invalidateQueries('bots')
        toast.success('Bot updated successfully')
      },
      onError: (error) => {
        toast.error(error?.message || 'Failed to update bot')
      }
    }
  )
  
  // Delete a bot
  const deleteBotMutation = useMutation(
    (botId: string) => botService.deleteBot(botId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bots')
        toast.success('Bot deleted successfully')
      },
      onError: (error) => {
        toast.error(error?.message || 'Failed to delete bot')
      }
    }
  )
  
  // Start a bot
  const startBotMutation = useMutation(
    (botId: string) => botService.startBot(botId),
    {
      onSuccess: (_, botId) => {
        queryClient.invalidateQueries(['bot', botId])
        queryClient.invalidateQueries('bots')
        toast.success('Bot started successfully')
      },
      onError: (error) => {
        toast.error(error?.message || 'Failed to start bot')
      }
    }
  )
  
  // Stop a bot
  const stopBotMutation = useMutation(
    (botId: string) => botService.stopBot(botId),
    {
      onSuccess: (_, botId) => {
        queryClient.invalidateQueries(['bot', botId])
        queryClient.invalidateQueries('bots')
        toast.success('Bot stopped successfully')
      },
      onError: (error) => {
        toast.error(error?.message || 'Failed to stop bot')
      }
    }
  )
  
  // Restart a bot
  const restartBotMutation = useMutation(
    (botId: string) => botService.restartBot(botId),
    {
      onSuccess: (_, botId) => {
        queryClient.invalidateQueries(['bot', botId])
        queryClient.invalidateQueries('bots')
        toast.success('Bot restarted successfully')
      },
      onError: (error) => {
        toast.error(error?.message || 'Failed to restart bot')
      }
    }
  )
  
  // Update API settings
  const updateAPISettingsMutation = useMutation(
    ({ botId, settings }: { botId: string; settings: APISettings }) => 
      botService.updateAPISettings(botId, settings),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['bot', variables.botId])
        toast.success('API settings updated successfully')
      },
      onError: (error) => {
        toast.error(error?.message || 'Failed to update API settings')
      }
    }
  )
  
  // These custom hooks for individual bot retrieval and logs need to be separate
  // since we can't call hooks conditionally or inside regular functions
  
  return {
    bots,
    botsLoading,
    botsError,
    refetchBots,
    createBot: createBotMutation.mutate,
    isCreatingBot: createBotMutation.isLoading,
    updateBot: updateBotMutation.mutate,
    isUpdatingBot: updateBotMutation.isLoading,
    deleteBot: deleteBotMutation.mutate,
    isDeletingBot: deleteBotMutation.isLoading,
    startBot: startBotMutation.mutate,
    isStartingBot: startBotMutation.isLoading,
    stopBot: stopBotMutation.mutate,
    isStoppingBot: stopBotMutation.isLoading,
    restartBot: restartBotMutation.mutate,
    isRestartingBot: restartBotMutation.isLoading,
    updateAPISettings: updateAPISettingsMutation.mutate,
    isUpdatingAPISettings: updateAPISettingsMutation.isLoading
  }
}

// Separate hooks for individual bot data and logs to avoid Rules of Hooks violations
export const useBot = (botId: string | undefined) => {
  return useQuery(
    ['bot', botId],
    () => botId ? botService.getBot(botId) : null,
    {
      enabled: !!botId,
      onError: (error) => {
        toast.error(error?.message || 'Failed to load bot')
      }
    }
  )
}

export const useBotLogs = (botId: string | undefined, lines: number = 50) => {
  return useQuery(
    ['bot-logs', botId, lines],
    () => botId ? botService.getBotLogs(botId, lines) : null,
    {
      enabled: !!botId,
      refetchInterval: false,
      onError: (error) => {
        toast.error(error?.message || 'Failed to load bot logs')
      }
    }
  )
}