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
  Tabs,
  Tab,
  styled
} from '@mui/material'
import { useState } from 'react'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

const StyledTab = styled(Tab)({
  textTransform: 'none',
  fontWeight: 'normal',
  fontSize: '1rem',
  '&.Mui-selected': {
    backgroundColor: '#F3F4F6',
  },
})

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

export default function IntegrationPage() {
  const [selectedTab, setSelectedTab] = useState(0)
  const [selectedAgent, setSelectedAgent] = useState('Sales Agent')
  const [deploymentEnabled, setDeploymentEnabled] = useState(false)
  const [agentName, setAgentName] = useState('')
  const [greetingMessage, setGreetingMessage] = useState('')
  const [referenceType, setReferenceType] = useState('include')
  const [showCode, setShowCode] = useState(true)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  const embedCode = `<iframe
  src="https://app.finiiteai.com/embed/agent/v1/jogpwrjgw"
  style="border: none; height: 500px; width: 600px"
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
                  <MenuItem value="Sales Agent">Sales Agent</MenuItem>
                  <MenuItem value="Support Agent">Support Agent</MenuItem>
                  <MenuItem value="Marketing Agent">Marketing Agent</MenuItem>
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
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Fixed Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' },
        mb: 4 
      }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
            Integration & deployment
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Deploy agents to your website or workflows.
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4 
      }}>
        {/* Left Sidebar */}
        <Box sx={{ 
          width: { xs: '100%', md: 200 },
          mb: { xs: 3, md: 0 }
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            Integration
          </Typography>
          <Tabs
            orientation="vertical"
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            sx={{
              borderRight: { xs: 0, md: 1 },
              borderBottom: { xs: 1, md: 0 },
              borderColor: 'divider',
              '& .MuiTab-root': {
                alignItems: 'flex-start',
                pl: 0,
              },
            }}
          >
            <StyledTab label="Embed via code" />
            <StyledTab label="Connect with API" />
          </Tabs>
        </Box>

        {/* Right Content */}
        <Box sx={{ flex: 1 }}>
          <TabPanel value={selectedTab} index={0}>
            <Box sx={{ maxWidth: 800 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Configuration
              </Typography>

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
                      {'  src="https://app.finiiteai.com/embed/agent/v1/jogpwrjgw"'}<br />
                      {'  style="border: none; height: 500px; width: 600px"'}<br />
                      {'/>'}<br />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={selectedTab} index={1}>
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
          </TabPanel>
        </Box>
      </Box>
    </Box>
  )
} 