"use client"
import { useState, useEffect } from 'react'
import { Box, Typography, Button, Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, AlertTitle, CircularProgress, Chip } from '@mui/material'
import Image from 'next/image'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { styled } from '@mui/material/styles'
import { toast } from "sonner"
import { useSession } from 'next-auth/react'

const KeyContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  width: '100%',
  overflow: 'hidden',
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

// Backend response types
interface APIKeyResponse {
  id: number
  user_id: number
  provider: string
  api_key: string
  is_valid: boolean
  last_validated: string
  created_at: string
  updated_at: string
}

interface ApiKey {
  provider: string
  key: string
  logo: string
  prefix?: string
  keyLength: number
  isValid?: boolean
  lastValidated?: string
  hasKey?: boolean
  backendProvider?: string // Backend enum value
}

export default function ApiKeysPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentProvider, setCurrentProvider] = useState<string>('')
  const [newApiKey, setNewApiKey] = useState('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [validatingKeys, setValidatingKeys] = useState<Set<string>>(new Set())
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { 
      provider: 'OpenAI', 
      key: '',
      logo: '/model_logo/openai-logo.svg',
      prefix: 'sk-', // Accepts both sk- and sk-proj-
      keyLength: 60, // Updated for new project keys
      hasKey: false,
      backendProvider: 'openai'
    },
    {
      provider: 'Gemini',
      key: '',
      logo: '/model_logo/google-logo.svg',
      prefix: 'AIzaSy',
      keyLength: 39,
      hasKey: false,
      backendProvider: 'gemini'
    },
    { 
      provider: 'DeepSeek', 
      key: '',
      logo: '/model_logo/deepseek-logo.svg',
      prefix: 'sk-',
      keyLength: 48,
      hasKey: false,
      backendProvider: 'deepseek'
    },
    { 
      provider: 'Anthropic', 
      key: '',
      logo: '/model_logo/anthropic-logo.svg',
      prefix: 'sk-ant-',
      keyLength: 108,
      hasKey: false,
      backendProvider: 'anthropic'
    },
    { 
      provider: 'Hugging Face', 
      key: '',
      logo: '/model_logo/hf-logo.svg',
      prefix: 'hf_',
      keyLength: 37,
      hasKey: false,
      backendProvider: 'huggingface'
    },
  ])

  const { data: session } = useSession()

  // Load existing API keys on component mount
  useEffect(() => {
    if (session?.user?.accessToken) {
      loadApiKeys()
    }
  }, [session])

  const loadApiKeys = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api-keys`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please try logging in again.')
        }
        throw new Error('Failed to load API keys')
      }

      const backendKeys: APIKeyResponse[] = await response.json()
      
      setApiKeys(prevKeys => 
        prevKeys.map(key => {
          const backendKey = backendKeys.find(bk => 
            bk.provider.toLowerCase() === key.backendProvider?.toLowerCase()
          )
          
          if (backendKey) {
            return {
              ...key,
              key: maskApiKey(backendKey.api_key, key),
              isValid: backendKey.is_valid,
              lastValidated: backendKey.last_validated,
              hasKey: true
            }
          }
          return key
        })
      )
    } catch (error) {
      console.error('Failed to load API keys:', error)
      toast.error('Failed to load existing API keys')
    }
  }

  const handleUpdateKey = (provider: string) => {
    setCurrentProvider(provider)
    setNewApiKey('')
    setErrorMessage('')
    setIsDialogOpen(true)
  }

  const handleSaveKey = async () => {
    if (!newApiKey.trim()) {
      setErrorMessage('API key cannot be empty')
      return
    }

    const apiKey = apiKeys.find(k => k.provider === currentProvider)
    if (!apiKey) return

    setLoading(true)
    setErrorMessage('')

    try {
      let response: Response
      let url: string
      let requestBody: any

      console.log('API Key operation:', {
        provider: currentProvider,
        backendProvider: apiKey.backendProvider,
        hasExistingKey: apiKey.hasKey,
        keyPrefix: newApiKey.substring(0, 8) + '...'
      })

      if (apiKey.hasKey) {
        // Update existing key - PUT /{provider}
        url = `${process.env.NEXT_PUBLIC_API_URL}/api-keys/${apiKey.backendProvider}`
        requestBody = { api_key: newApiKey }
        
        console.log('UPDATE request:', { url, body: { api_key: newApiKey.substring(0, 8) + '...' } })
        
        response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify(requestBody),
          credentials: 'include',
        })
      } else {
        // Create new key - POST /
        url = `${process.env.NEXT_PUBLIC_API_URL}/api-keys`
        requestBody = {
          provider: apiKey.backendProvider,
          api_key: newApiKey
        }
        
        console.log('CREATE request:', { 
          url, 
          body: { 
            provider: apiKey.backendProvider, 
            api_key: newApiKey.substring(0, 8) + '...' 
          } 
        })
        
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify(requestBody),
          credentials: 'include',
        })
      }

      console.log('Response status:', response.status)

      if (!response.ok) {
        let errorDetails = 'Unknown error'
        try {
          const errorData = await response.json()
          errorDetails = errorData.detail || errorData.message || JSON.stringify(errorData)
          console.error('API Error Response:', errorData)
        } catch (e) {
          const errorText = await response.text()
          errorDetails = errorText || `HTTP ${response.status} ${response.statusText}`
          console.error('API Error Text:', errorText)
        }

        if (response.status === 401) {
          throw new Error('Authentication failed. Please try logging in again.')
        }
        
        throw new Error(errorDetails)
      }

      const result: APIKeyResponse = await response.json()
      console.log('Success response:', { 
        provider: result.provider, 
        isValid: result.is_valid,
        keyPrefix: result.api_key.substring(0, 8) + '...'
      })

      // Update local state
      setApiKeys(keys => keys.map(k => 
        k.provider === currentProvider 
          ? { 
              ...k, 
              key: maskApiKey(result.api_key, k),
              isValid: result.is_valid,
              lastValidated: result.last_validated,
              hasKey: true
            }
          : k
      ))

      setIsDialogOpen(false)
      toast.success(`${currentProvider} API key ${apiKey.hasKey ? 'updated' : 'added'} successfully!`)
    } catch (error) {
      console.error('handleSaveKey error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save API key')
    } finally {
      setLoading(false)
    }
  }

  const handleValidateKey = async (provider: string) => {
    const apiKey = apiKeys.find(k => k.provider === provider)
    if (!apiKey?.hasKey || !apiKey.backendProvider) return

    setValidatingKeys(prev => new Set(prev).add(provider))
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api-keys/${apiKey.backendProvider}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed')
        }
        const error = await response.json()
        throw new Error(error.detail || 'Validation failed')
      }

      const result: APIKeyResponse = await response.json()
      
      setApiKeys(keys => keys.map(k => 
        k.provider === provider 
          ? { 
              ...k, 
              isValid: result.is_valid,
              lastValidated: result.last_validated
            }
          : k
      ))

      if (result.is_valid) {
        toast.success(`${provider} API key is valid`)
      } else {
        toast.error(`${provider} API key is invalid`)
      }
    } catch (error) {
      toast.error(`Failed to validate ${provider} API key: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setApiKeys(keys => keys.map(k => 
        k.provider === provider 
          ? { ...k, isValid: false }
          : k
      ))
    } finally {
      setValidatingKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(provider)
        return newSet
      })
    }
  }

  const maskApiKey = (key: string, apiKey: ApiKey): string => {
    if (!key) return 'No key set'
    
    if (key.length <= 8) {
      return 'x'.repeat(key.length)
    }
    
    // Show first 4 and last 4 characters
    return key.substring(0, 4) + 'x'.repeat(Math.max(8, key.length - 8)) + key.substring(key.length - 4)
  }

  const getStatusIcon = (apiKey: ApiKey) => {
    if (!apiKey.hasKey) {
      return null
    }
    
    if (apiKey.isValid === true) {
      return <CheckCircleOutlineIcon color="success" sx={{ flexShrink: 0 }} />
    } else if (apiKey.isValid === false) {
      return <ErrorOutlineIcon color="error" sx={{ flexShrink: 0 }} />
    }
    
    return null
  }

  const getStatusChip = (apiKey: ApiKey) => {
    if (!apiKey.hasKey) {
      return <Chip label="Not Set" color="default" size="small" />
    }
    
    if (apiKey.isValid === true) {
      return <Chip label="Valid" color="success" size="small" />
    } else if (apiKey.isValid === false) {
      return <Chip label="Invalid" color="error" size="small" />
    }
    
    return <Chip label="Unknown" color="warning" size="small" />
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
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {getStatusChip(apiKey)}
                {apiKey.hasKey && (
                  <Button
                    size="small"
                    onClick={() => handleValidateKey(apiKey.provider)}
                    disabled={validatingKeys.has(apiKey.provider)}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    {validatingKeys.has(apiKey.provider) ? (
                      <CircularProgress size={16} />
                    ) : (
                      'Validate'
                    )}
                  </Button>
                )}
                <GetKeyButton 
                  variant="outlined"
                  onClick={() => handleUpdateKey(apiKey.provider)}
                >
                  {apiKey.hasKey ? 'Update key' : 'Set key'}
                </GetKeyButton>
              </Box>
            </KeyRow>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              width: '100%',
              overflow: 'hidden'
            }}>
              <ApiKeyText sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: apiKey.hasKey ? 'text.secondary' : 'text.disabled'
              }}>
                {apiKey.key || 'No key set'}
              </ApiKeyText>
              {getStatusIcon(apiKey)}
            </Box>
            {apiKey.lastValidated && (
              <Typography variant="caption" color="text.disabled">
                Last validated: {new Date(apiKey.lastValidated).toLocaleString()}
              </Typography>
            )}
          </KeyContainer>
        ))}
      </Stack>

      {/* Update API Key Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => {
          setIsDialogOpen(false)
          setErrorMessage('')
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {apiKeys.find(k => k.provider === currentProvider)?.hasKey ? 'Update' : 'Add'} {currentProvider} API Key
        </DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {errorMessage}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="API Key"
            type="password"
            fullWidth
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.target.value)}
            placeholder={`Enter your ${currentProvider} API key...`}
            sx={{ mt: 2 }}
            disabled={loading}
          />
          {currentProvider && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {(() => {
                const provider = apiKeys.find(k => k.provider === currentProvider)
                if (currentProvider === 'OpenAI') {
                  return 'Key should start with "sk-" or "sk-proj-"'
                }
                return provider?.prefix 
                  ? `Key should start with "${provider.prefix}"`
                  : 'Enter your API key exactly as provided by the service'
              })()}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsDialogOpen(false)} 
            color="inherit"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveKey} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Save Key'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
