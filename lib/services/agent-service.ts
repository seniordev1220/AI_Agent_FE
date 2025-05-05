import { CustomAgent } from "@/types/agent"

interface CreateAgentData {
  name: string
  description: string
  avatar: string
  greeting: string
  instructions: string
  model: string
  isPrivate: boolean
  categories: string
  knowledgeBaseEnabled: boolean
  knowledgeBaseSources: string[]
  createdAt: Date
  updatedAt: Date
}

export class AgentService {
  static async getMyAgents(): Promise<CustomAgent[]> {
    try {
      const response = await fetch('/api/agents/my-agents')
      if (!response.ok) {
        throw new Error('Failed to fetch agents')
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching agents:', error)
      throw error
    }
  }

  static async createAgent(agentData: CreateAgentData): Promise<CustomAgent> {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create agent')
      }

      return response.json()
    } catch (error) {
      console.error('Error creating agent:', error)
      throw error
    }
  }

  static async getAgentById(id: string): Promise<CustomAgent | null> {
    try {
      const response = await fetch(`/api/agents/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Failed to fetch agent')
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching agent:', error)
      throw error
    }
  }

  static async updateAgent(id: string, agentData: Partial<CreateAgentData>): Promise<CustomAgent> {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      })

      if (!response.ok) {
        throw new Error('Failed to update agent')
      }

      return response.json()
    } catch (error) {
      console.error('Error updating agent:', error)
      throw error
    }
  }

  static async deleteAgent(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete agent')
      }
    } catch (error) {
      console.error('Error deleting agent:', error)
      throw error
    }
  }

  static async uploadAgentImage(file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/agents/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }
} 