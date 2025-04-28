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
}

export default function ApiKeysPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentProvider, setCurrentProvider] = useState<string>('')
  const [newApiKey, setNewApiKey] = useState('')
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { provider: 'OpenAI', key: 'zk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', logo: '/model_logo/openai-logo.png' },
    { provider: 'Google Gemini', key: 'zk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', logo: '/model_logo/gemini-logo.png' },
    { provider: 'Anthropic', key: 'zk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', logo: '/model_logo/anthropic-logo.png' },
    { provider: 'Hugging Face', key: 'zk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', logo: '/model_logo/hf-logo.png' },
    { provider: 'DeepSeek', key: 'zk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', logo: '/model_logo/deepseek-logo.png' },
    { provider: 'Perplexity', key: 'zk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', logo: '/model_logo/perplexity-logo.png' },
  ])

  const handleUpdateKey = (provider: string) => {
    setCurrentProvider(provider)
    setNewApiKey('')
    setIsDialogOpen(true)
  }

  const handleSaveKey = () => {
    if (newApiKey) {
      setApiKeys(keys => keys.map(k => 
        k.provider === currentProvider 
          ? { ...k, key: maskApiKey(newApiKey) }
          : k
      ))
      setIsDialogOpen(false)
    }
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 2) return key
    return key.substring(0, 2) + 'x'.repeat(key.length - 2)
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