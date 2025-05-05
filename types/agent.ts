export interface Agent {
  id: string
  name: string
  avatar: string
  description: string
  greeting: string
  // Add any other common properties both AI and custom agents share
}

export interface AIAgent extends Agent {
  model?: string
  capabilities?: string[]
  // Add any AI-specific properties
}

export interface CustomAgent extends Agent {
  createdAt: Date
  updatedAt: Date
  // Add any custom agent-specific properties
}