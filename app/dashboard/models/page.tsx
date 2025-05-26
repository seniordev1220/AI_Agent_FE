"use client"
import { Box, Typography, Button, Card, Switch, styled, Select, MenuItem, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const ModelCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

interface Model {
  ai_model_name: string
  provider: string
  logo_path: string
  is_enabled: boolean
  is_default: boolean
}

export default function ModelsPage() {
  const { data: session } = useSession()
  const [defaultModel, setDefaultModel] = useState('')
  const [models, setModels] = useState<Model[]>([])
  const [customModelDialogOpen, setCustomModelDialogOpen] = useState(false)
  const [openSourcedModels, setOpenSourcedModels] = useState<Model[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session?.user.accessToken) return

    const fetchModels = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/models`, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch models')
        }

        const data = await response.json()
        setDefaultModel(data.default_model)
        setModels(data.models)
        setOpenSourcedModels(data.open_sourced_models)
      } catch (error) {
        console.error('Error fetching models:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchModels()
  }, [session])

  const handleModelToggle = async (modelName: string) => {
    if (!session?.user.accessToken) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/models/${modelName}/toggle`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to toggle model')
      }

      const updatedModel = await response.json()

      // Update the models state
      setModels(prevModels =>
        prevModels.map(model =>
          model.ai_model_name === modelName
            ? { ...model, is_enabled: updatedModel.is_enabled }
            : model
        )
      )

      setOpenSourcedModels(prevModels =>
        prevModels.map(model =>
          model.ai_model_name === modelName
            ? { ...model, is_enabled: updatedModel.is_enabled }
            : model
        )
      )
    } catch (error) {
      console.error('Error toggling model:', error)
    }
  }

  const handleDefaultModelChange = async (newDefaultModel: string) => {
    if (!session?.user.accessToken) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/models/default/${newDefaultModel}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to set default model')
      }

      setDefaultModel(newDefaultModel)
    } catch (error) {
      console.error('Error setting default model:', error)
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ 
        p: 4, 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        AI Models
      </Typography>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Default Model:
        </Typography>
        <FormControl sx={{ maxWidth: '600px', width: '100%' }}>
          <Select
            value={defaultModel}
            onChange={(e) => handleDefaultModelChange(e.target.value)}
            sx={{
              backgroundColor: 'background.paper',
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: 1,
              },
            }}
          >
            {models
              .filter(model => model.is_enabled)
              .map((model) => (
                <MenuItem key={model.ai_model_name} value={model.ai_model_name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Image
                      src={model.logo_path}
                      alt={`${model.ai_model_name} logo`}
                      width={24}
                      height={24}
                    />
                    {model.ai_model_name}
                  </Box>
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3, mb: 6 }}>
        {models.map((model) => (
          <ModelCard key={model.ai_model_name}>
            <Image
              src={model.logo_path}
              alt={`${model.ai_model_name} logo`}
              width={40}
              height={40}
            />
            <Typography sx={{ flex: 1 }}>{model.ai_model_name}</Typography>
            <Switch 
              checked={model.is_enabled}
              onChange={() => handleModelToggle(model.ai_model_name)}
            />
          </ModelCard>
        ))}
      </Box>

      <Typography variant="h6" sx={{ mb: 3 }}>
        Open sourced models
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
        {openSourcedModels.map((model) => (
          <ModelCard key={model.ai_model_name}>
            <Image
              src={model.logo_path}
              alt={`${model.ai_model_name} logo`}
              width={40}
              height={40}
            />
            <Typography sx={{ flex: 1 }}>{model.ai_model_name}</Typography>
            <Switch 
              checked={model.is_enabled}
              onChange={() => handleModelToggle(model.ai_model_name)}
            />
          </ModelCard>
        ))}
      </Box>

      {/* Custom Model Dialog */}
      <Dialog
        open={customModelDialogOpen}
        onClose={() => setCustomModelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Custom Model Deployment</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            For custom model deployment or self-hosting options, please contact our team. We can help you:
          </Typography>
          <Box component="ul" sx={{ mt: 2, pl: 2 }}>
            <li>Set up self-hosted models on your infrastructure</li>
            <li>Configure custom model integrations</li>
            <li>Optimize model performance for your use case</li>
            <li>Ensure security and compliance requirements</li>
          </Box>
          <Typography sx={{ mt: 2 }}>
            Contact us at:{' '}
            <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              <a href="mailto:contact@finiite.com" style={{ color: 'inherit', textDecoration: 'underline' }}>
                contact@finiite.com
              </a>
            </Box>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomModelDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
