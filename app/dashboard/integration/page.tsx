"use client"
import { 
  Box, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  Switch, 
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  styled,
  Tab
} from '@mui/material'
import { useState, useEffect } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ChatInterface } from '@/components/ai-agents/chat-interface'
import { toast } from 'sonner'

const StyledTab = styled(Tab)({
  textTransform: 'none',
  fontWeight: 'normal',
  fontSize: '1rem',
  '&.Mui-selected': {
    backgroundColor: '#F3F4F6',
  },
})

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: theme.palette.grey[100],
    borderRadius: '8px',
  },
}))

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

interface Agent {
  id: string;
  name: string;
  description: string;
  welcome_message: string;
  avatar: string;
  avatar_base64: string;
  theme?: string;
  position?: string;
  height?: string;
  width?: string;
}

export default function IntegrationPage() {
  const searchParams = useSearchParams()
  const agentId = searchParams.get('agentId')
  const [selectedTab, setSelectedTab] = useState('embed')
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [deploymentEnabled, setDeploymentEnabled] = useState(false)
  const [agentName, setAgentName] = useState('')
  const [greetingMessage, setGreetingMessage] = useState('')
  const [referenceType, setReferenceType] = useState('include')
  const [showCode, setShowCode] = useState(true)
  const [myAgents, setMyAgents] = useState<Agent[]>([])
  const { data: session } = useSession()
  const [finiiteApiKey, setFiniiteApiKey] = useState<string>('')

  useEffect(() => {
    const fetchAgents = async () => {
      if (!session?.user?.accessToken) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch agents');
        const agents = await response.json();
        setMyAgents(agents);

        // If agentId is provided, select that agent
        if (agentId) {
          const agent = agents.find((a: any) => a.id === agentId);
          if (agent) {
            setSelectedAgent(agent.id);
            setAgentName(agent.name);
            setGreetingMessage(agent.welcome_message || '');
            // Store other agent properties as needed
          }
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        toast.error('Failed to fetch agents');
      }
    };

    const fetchUserProfile = async () => {
      if (!session?.user?.accessToken) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch user profile');
        const userData = await response.json();
        setFiniiteApiKey(userData.finiite_api_key || '');
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to fetch API key');
      }
    };

    if (session) {
      fetchAgents();
      fetchUserProfile();
    }
  }, [agentId, session]);

  const handleTabChange = (newValue: string) => {
    setSelectedTab(newValue)
  }

  const embedCode = `<iframe
    src="https://app.finiite.com/embed/${selectedAgent}/${finiiteApiKey}?references=${referenceType}"
    style="border: none; height: 500px; width: 600px;"
></iframe>`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode)
    // Optionally add a toast notification here
  }

  const handlePreview = () => {
    // Toggle between code and preview
    setShowCode(false);
  };

  const handleShowCode = () => {
    setShowCode(true);
  };

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        {...other}
      >
        {value === index && (
          <Box>
            {/* Fixed Header Section */}
            <Box sx={{ 
              top: 0,
              bgcolor: 'white',
              zIndex: 1,
              pt: 3,
              pb: 3,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3
              }}>
                <Typography variant="h6">
                  Select the agent you want to deploy.
                </Typography>
              </Box>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  {myAgents.map((agent) => (
                    <MenuItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ p: 3 }}>
              {children}
            </Box>
          </Box>
        )}
      </div>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <Box sx={{ width: 250, borderRight: '1px solid', borderColor: 'grey.200', p: 2 }}>
        <Typography className='text-base' sx={{ p: 2, color: 'grey.500' }}>
          Integration
        </Typography>
        <List>
          <ListItem disablePadding>
            <StyledListItemButton
              selected={selectedTab === 'embed'}
              onClick={() => handleTabChange('embed')}
              sx={{ my: 0.5 }}
            >
              <ListItemText primary="Embed via code" />
            </StyledListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <StyledListItemButton
              selected={selectedTab === 'api'}
              onClick={() => handleTabChange('api')}
              sx={{ my: 0.5 }}
            >
              <ListItemText primary="Connect with API" />
            </StyledListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <div>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              Integration & deployment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Deploy agents to your website or workflows.
            </Typography>
          </div>
        </Box>

        {/* Finiite API Key Section - Always visible */}
        <Box sx={{ maxWidth: 800, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Finiite API Key
          </Typography>
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              value={finiiteApiKey}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(finiiteApiKey);
                      toast.success('API key copied to clipboard');
                    }}
                    startIcon={<ContentCopyIcon />}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: 'transparent',
                        color: 'text.primary',
                      },
                    }}
                  >
                    copy
                  </Button>
                ),
                sx: {
                  bgcolor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E5E7EB',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E5E7EB',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E5E7EB',
                  },
                  borderRadius: '8px',
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  fontFamily: 'monospace'
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Use this API key to authenticate your requests to the Finiite API
            </Typography>
          </Box>
        </Box>

        {/* Content based on selected tab */}
        {selectedTab === 'embed' ? (
          <Box>
            {/* Agent Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Select the agent you want to deploy
              </Typography>
              <FormControl fullWidth sx={{ maxWidth: 800 }}>
                <Select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  {myAgents.map((agent) => (
                    <MenuItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Configuration Section */}
            <Box sx={{ maxWidth: 800 }}>
              {/* Deployment Toggle */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3 
              }}>
                <Box>
                  <Typography variant="h6">Enable agent deployment</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enabling this will allow the agent to be deployed on your site.
                    Disabling will remove all existing deployments.
                  </Typography>
                </Box>
                <Switch
                  checked={deploymentEnabled}
                  onChange={(e) => setDeploymentEnabled(e.target.checked)}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Agent Name
                </Typography>
                <TextField
                  fullWidth
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Greeting Message
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={greetingMessage}
                  onChange={(e) => setGreetingMessage(e.target.value)}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Privacy: Source References
                </Typography>
                <RadioGroup
                  value={referenceType}
                  onChange={(e) => setReferenceType(e.target.value)}
                >
                  <FormControlLabel 
                    value="disable" 
                    control={<Radio />} 
                    label="Disable references"
                  />
                  <FormControlLabel 
                    value="include" 
                    control={<Radio />} 
                    label={
                      <Box>
                        <Typography>Include references (default)</Typography>
                        <Typography variant="body2" color="text.secondary">
                          This will include all sources of your data and training documents as a point of reference. Including private ones.
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </Box>

              {/* Embed Code Section */}
              <Box sx={{ mt: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 2 
                }}>
                  <Typography variant="h6">
                    Embed code
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    copy the iframe code to your html code on website
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mb: 2,
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <Button
                    fullWidth={true}
                    variant={showCode ? "contained" : "outlined"}
                    onClick={handleShowCode}
                    sx={{
                      bgcolor: showCode ? '#F3F4F6' : 'transparent',
                      color: 'text.primary',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: '#F3F4F6',
                      },
                      boxShadow: 'none',
                    }}
                  >
                    Code
                  </Button>
                  <Button
                    fullWidth={true}
                    variant={!showCode ? "contained" : "outlined"}
                    onClick={handlePreview}
                    sx={{
                      bgcolor: !showCode ? '#F3F4F6' : 'transparent',
                      color: 'text.primary',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: '#F3F4F6',
                      },
                      boxShadow: 'none',
                    }}
                  >
                    Preview
                  </Button>
                </Box>

                {showCode ? (
                  // Code view
                  <Box
                    sx={{
                      position: 'relative',
                      bgcolor: '#f8f9fa',
                      borderRadius: 1,
                      p: 2,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      overflow: 'auto'
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end', 
                      mb: 1 
                    }}>
                      <Button
                        startIcon={<ContentCopyIcon />}
                        onClick={handleCopyCode}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            bgcolor: 'transparent',
                            color: 'text.primary',
                          },
                        }}
                      >
                        copy
                      </Button>
                    </Box>
                    <pre>{embedCode}</pre>
                  </Box>
                ) : (
                  // Preview - Using the same ChatInterface component
                  <Box sx={{ 
                    height: '600px', 
                    width: '400px',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}>
                    <ChatInterface
                      agent={
                        selectedAgent ? {
                          id: selectedAgent,
                          name: agentName || '',
                          description: myAgents.find(a => a.id === selectedAgent)?.description || '',
                          welcome_message: greetingMessage || '',
                          avatar_base64: myAgents.find(a => a.id === selectedAgent)?.avatar_base64 || '',
                          avatar: myAgents.find(a => a.id === selectedAgent)?.avatar || '/agents/code.svg',
                          theme: 'light',
                          position: 'bottom-right',
                          height: '600px',
                          width: '400px'
                        } : null
                      }
                      isEmbedded={true}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ maxWidth: 800 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              API endpoint:
            </Typography>
            <TextField
              fullWidth
              value="app.finiite.com/demo/api"
              InputProps={{
                readOnly: true,
                sx: {
                  bgcolor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E5E7EB',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E5E7EB',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E5E7EB',
                  },
                  borderRadius: '8px',
                  fontSize: { xs: '0.875rem', md: '1rem' },
                }
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
} 
