"use client"
import { Box, Typography, Button, Card, Switch, styled, Select, MenuItem, FormControl, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import Image from 'next/image'
import React from 'react'

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
  name: string
  logo: string
  enabled: boolean
}

const models: Model[] = [
  { name: 'GPT-4.5', logo: '/model_logo/openai-logo.svg', enabled: true },
  { name: 'O1-mini', logo: '/model_logo/gpt4-mini-logo.svg', enabled: false },
  { name: 'GPT-4o Mini', logo: '/model_logo/gpt4-mini-logo.svg', enabled: false },
  { name: 'Claude-3.5', logo: '/model_logo/anthropic-logo.svg', enabled: true },
  { name: 'Claude-3.7', logo: '/model_logo/anthropic-logo.svg', enabled: true },
  { name: 'Gemini', logo: '/model_logo/google-logo.svg', enabled: false },
  { name: 'Mistral', logo: '/model_logo/mistral-logo.svg', enabled: false },
]

const openSourcedModels: Model[] = [
  { name: 'Hugging Face', logo: '/model_logo/hf-logo.svg', enabled: false },
  { name: 'DeepSeek', logo: '/model_logo/deepseek-logo.svg', enabled: false },
  { name: 'Perplexity AI', logo: '/model_logo/perplexity-logo.svg', enabled: false },
  { name: 'Meta: llama. 3.2 1B', logo: '/model_logo/meta-logo.svg', enabled: false },
]

export default function ModelsPage() {
  const [defaultModel, setDefaultModel] = React.useState('Claude-3.7')
  const [customModelDialogOpen, setCustomModelDialogOpen] = React.useState(false)
  const [modelStates, setModelStates] = React.useState<Record<string, boolean>>(
    models.reduce((acc, model) => ({ ...acc, [model.name]: model.enabled }), {})
  )
  const [openSourcedModelStates, setOpenSourcedModelStates] = React.useState<Record<string, boolean>>(
    openSourcedModels.reduce((acc, model) => ({ ...acc, [model.name]: model.enabled }), {})
  )

  const handleModelToggle = (modelName: string) => {
    setModelStates(prev => ({
      ...prev,
      [modelName]: !prev[modelName]
    }))
  }

  const handleOpenSourcedToggle = (modelName: string) => {
    setOpenSourcedModelStates(prev => ({
      ...prev,
      [modelName]: !prev[modelName]
    }))
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
            onChange={(e) => setDefaultModel(e.target.value)}
            sx={{
              backgroundColor: 'background.paper',
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: 1,
              },
            }}
          >
            {models.map((model) => (
              <MenuItem key={model.name} value={model.name}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Image
                    src={model.logo}
                    alt={`${model.name} logo`}
                    width={24}
                    height={24}
                  />
                  {model.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => setCustomModelDialogOpen(true)}
            sx={{
              bgcolor: 'black',
              color: 'white',
              '&:hover': {
                bgcolor: 'black',
                opacity: 0.9,
              },
            }}
          >
            Add custom model
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3, mb: 6 }}>
        {models.map((model) => (
          <ModelCard key={model.name}>
            <Image
              src={model.logo}
              alt={`${model.name} logo`}
              width={40}
              height={40}
            />
            <Typography sx={{ flex: 1 }}>{model.name}</Typography>
            <Switch 
              checked={modelStates[model.name] ?? model.enabled}
              onChange={() => handleModelToggle(model.name)}
            />
          </ModelCard>
        ))}
      </Box>

      <Typography variant="h6" sx={{ mb: 3 }}>
        Open sourced models
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
        {openSourcedModels.map((model) => (
          <ModelCard key={model.name}>
            <Image
              src={model.logo}
              alt={`${model.name} logo`}
              width={40}
              height={40}
            />
            <Typography sx={{ flex: 1 }}>{model.name}</Typography>
            <Switch 
              checked={openSourcedModelStates[model.name] ?? false}
              onChange={() => handleOpenSourcedToggle(model.name)}
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
            Contact us at: contact@finiite.com
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
