"use client"
import { Box, Typography, Button, Card, IconButton, styled } from '@mui/material'
import Image from 'next/image'
import AddIcon from '@mui/icons-material/Add'
import CodeIcon from '@mui/icons-material/Code'
import SettingsIcon from '@mui/icons-material/Settings'
import { useRouter } from 'next/navigation'

const AgentCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

const SidebarItem = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

const agents = [
  {
    name: 'Sales Agent',
    description: 'Enrich leads in Salesforce, help book meetings with prospect information.',
    avatar: '/agents/sales-agent.png',
  },
  {
    name: 'Data Analyst',
    description: 'Extract valuable information from complex data.',
    avatar: '/agents/data-analyst.png',
  },
  {
    name: 'Competitor Market Research Agent',
    description: 'Generate reports that secure more deals for the team.',
    avatar: '/agents/market-research.png',
  },
]

const categories = [
  'Sales',
  'Tech',
  'Marketing',
  'Operations',
  'Business Development',
  'HR',
  'Customer Support',
  'Research',
  'Personal',
]

export default function AgentsPage() {
  const router = useRouter();
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box sx={{ 
        width: 250, 
        p: 3,
        backgroundColor: 'background.default',
        borderRight: '1px solid',
        borderColor: 'divider'
      }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: 'black',
            color: 'white',
            mb: 4,
            '&:hover': {
              backgroundColor: 'black',
              opacity: 0.9,
            },
          }}
          onClick={() => router.push('/dashboard/my-agents/create')}
        >
          Create New Agent
        </Button>

        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
          My Agents
        </Typography>

        {categories.map((category) => (
          <SidebarItem key={category}>
            {category}
          </SidebarItem>
        ))}
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Your AI Agents
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          Chat with your AI assistants or seamlessly integrate with your workflows.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {agents.map((agent) => (
            <AgentCard key={agent.name}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Image
                  src={agent.avatar}
                  alt={agent.name}
                  width={40}
                  height={40}
                  style={{ borderRadius: '50%' }}
                />
                <Typography variant="h6" sx={{ ml: 2 }}>
                  {agent.name}
                </Typography>
              </Box>
              
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {agent.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: 'black',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'black',
                      opacity: 0.9,
                    },
                  }}
                >
                  open
                </Button>
                <IconButton size="small">
                  <CodeIcon />
                </IconButton>
                <IconButton size="small">
                  <SettingsIcon />
                </IconButton>
              </Box>
            </AgentCard>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
