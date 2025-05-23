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
  const [myAgents, setMyAgents] = useState<any[]>([])
  const { data: session } = useSession()

  useEffect(() => {
    const fetchAgents = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch agents')
      const agents = await response.json()
      setMyAgents(agents)
      console.log(agents)
      // If agentId is provided, select that agent
      if (agentId) {
        const agent = agents.find((a: any) => a.id === agentId)
        if (agent) {
            setSelectedAgent(agent.id)
            setAgentName(agent.name)
            setGreetingMessage(agent.welcomeMessage || '')
        }
      }
    }

    if (session) {
      fetchAgents()
    }
  }, [agentId, session])

  const handleTabChange = (newValue: string) => {
    setSelectedTab(newValue)
  }

  const embedCode = `<iframe
  src="https://app.finiiteai.com/embed/agent/v1/${agentId || 'jogpwrjgw'}?theme=chat"
  style="border: none; height: 600px; width: 400px"
/>`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode)
    // Optionally add a toast notification here
  }

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
                <Button 
                  variant="contained" 
                  sx={{ 
                    bgcolor: '#9FB5F1',
                    '&:hover': {
                      bgcolor: '#8CA1E0'
                    }
                  }}
                >
                  Save
                </Button>
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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained"
              sx={{ 
                bgcolor: '#3366FF',
                '&:hover': {
                  bgcolor: '#2952CC'
                }
              }}
            >
              Save
            </Button>
          </Box>
        </Box>

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

        {/* Content based on selected tab */}
        {selectedTab === 'embed' ? (
          <Box>
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
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', md: 'center' }, 
                  mb: 2 
                }}>
                  <Typography variant="h6" sx={{ mb: { xs: 1, md: 0 } }}>
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
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: { xs: '100%', sm: 'auto' }
                }}>
                  <Button
                    fullWidth={true}
                    variant={showCode ? "contained" : "outlined"}
                    onClick={() => setShowCode(true)}
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
                    onClick={() => setShowCode(false)}
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

                <Box
                  sx={{
                    position: 'relative',
                    bgcolor: '#f8f9fa',
                    borderRadius: 1,
                    p: { xs: 1.5, sm: 2 },
                    fontFamily: 'monospace',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    lineHeight: '1.5',
                    overflow: 'auto'
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    mb: 1,
                    position: 'sticky',
                    top: 0,
                    bgcolor: '#f8f9fa',
                    py: 1
                  }}>
                    <Button
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyCode}
                      sx={{
                        color: 'text.secondary',
                        textTransform: 'none',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        '&:hover': {
                          bgcolor: 'transparent',
                          color: 'text.primary',
                        },
                      }}
                    >
                      copy
                    </Button>
                  </Box>
                  <Box sx={{ 
                    display: 'flex',
                    '& .line-numbers': {
                      color: 'text.secondary',
                      mr: 2,
                      textAlign: 'right',
                      userSelect: 'none',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }
                  }}>
                    <Box className="line-numbers">
                      1<br />
                      2<br />
                      3<br />
                      4
                    </Box>
                    <Box sx={{ 
                      flex: 1, 
                      color: 'text.primary',
                      wordBreak: 'break-all',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>
                      {'<iframe'}<br />
                      {'  src="https://app.finiiteai.com/embed/agent/v1/'}${agentId || 'jogpwrjgw'}?theme=chat"{'}'}<br />
                      {'  style="border: none; height: 600px; width: 400px"'}<br />
                      {'/>'}<br />
                    </Box>
                  </Box>
                </Box>
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
              value="api.finiiteai.com/njofpweewn"
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