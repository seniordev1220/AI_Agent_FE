"use client"
import { useState } from 'react'
import { Box, Typography, Button, Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import Image from 'next/image'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { styled } from '@mui/material/styles'

const KeyContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}))

const KeyRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}))

const GetKeyButton = styled(Button)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

const ApiKeyText = styled(Typography)(({ theme }) => ({
  fontFamily: 'monospace',
  color: theme.palette.text.secondary,
  flex: 1,
}))

interface ApiKey {
  provider: string
  key: string
  logo: string
  prefix?: string
  keyLength: number
}

export default function ApiKeysPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentProvider, setCurrentProvider] = useState<string>('')
  const [newApiKey, setNewApiKey] = useState('')
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { 
      provider: 'OpenAI', 
      key: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      logo: '/model_logo/openai-logo.png',
      prefix: 'sk-',
      keyLength: 51
    },
    {
      provider: 'Gemini',
      key: 'AIzaSyA-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      logo: '/model_logo/gemini-logo.png',
      prefix: 'AIzaSyA-',
      keyLength: 39
    },
    { 
      provider: 'DeepSeek', 
      key: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      logo: '/model_logo/deepseek-logo.png',
      prefix: 'sk-',
      keyLength: 48
    },
    { 
      provider: 'Anthropic', 
      key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      logo: '/model_logo/anthropic-logo.png',
      prefix: '',
      keyLength: 32
    },
    { 
      provider: 'Hugging Face', 
      key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      logo: '/model_logo/hf-logo.png',
      prefix: '',
      keyLength: 37
    },
    { 
      provider: 'Perplexity', 
      key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      logo: '/model_logo/perplexity-logo.png',
      prefix: '',
      keyLength: 32
    },
  ])

  const handleUpdateKey = (provider: string) => {
    setCurrentProvider(provider)
    setNewApiKey('')
    setIsDialogOpen(true)
  }

  const handleSaveKey = () => {
    if (newApiKey) {
      const apiKey = apiKeys.find(k => k.provider === currentProvider)
      if (apiKey && isValidApiKey(newApiKey, apiKey)) {
        setApiKeys(keys => keys.map(k => 
          k.provider === currentProvider 
            ? { ...k, key: maskApiKey(newApiKey, k) }
            : k
        ))
        setIsDialogOpen(false)
      } else {
        // You might want to show an error message here
        alert(`Invalid API key format for ${currentProvider}`)
      }
    }
  }

  const isValidApiKey = (key: string, apiKey: ApiKey): boolean => {
    if (apiKey.prefix && !key.startsWith(apiKey.prefix)) {
      return false
    }
    return key.length === apiKey.keyLength
  }

  const maskApiKey = (key: string, apiKey: ApiKey): string => {
    if (apiKey.prefix) {
      return apiKey.prefix + 'x'.repeat(apiKey.keyLength - apiKey.prefix.length)
    }
    return 'x'.repeat(apiKey.keyLength)
  }

  return (
    <Box sx={{ p: 4, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h5" sx={{ mb: 4, color: 'text.primary' }}>
        API Keys
      </Typography>

      <Stack spacing={4}>
        {apiKeys.map((apiKey) => (
          <KeyContainer key={apiKey.provider} elevation={0}>
            <KeyRow>
              <Image
                src={apiKey.logo}
                alt={`${apiKey.provider} Logo`}
                width={40}
                height={40}
              />
              <Typography variant="h6" sx={{ flex: 1 }}>
                {apiKey.provider} API key:
              </Typography>
              <GetKeyButton 
                variant="outlined"
                onClick={() => handleUpdateKey(apiKey.provider)}
              >
                Update key
              </GetKeyButton>
            </KeyRow>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ApiKeyText>
                {apiKey.key}
              </ApiKeyText>
              <CheckCircleOutlineIcon color="success" />
            </Box>
          </KeyContainer>
        ))}
      </Stack>

      {/* Update API Key Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Update {currentProvider} API Key
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="API Key"
            type="text"
            fullWidth
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveKey} variant="contained" color="primary">
            Set Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}