"use client"
import { Box, Typography, Button, TextField, Switch, Select, MenuItem, FormControl, InputLabel, Chip, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useState, useEffect } from 'react'
import AddIcon from '@mui/icons-material/Add'
import FolderIcon from '@mui/icons-material/Folder'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckIcon from '@mui/icons-material/Check'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

const StyledSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .section-title': {
    fontWeight: 500,
    marginBottom: theme.spacing(3),
  },
}))

const ActionButton = styled(Button)(({ theme }) => ({
  height: 48,
  minWidth: 120,
}))

const ImageUploadButton = styled(Box)(({ theme }) => ({
  width: 100,
  height: 100,
  borderRadius: '50%',
  backgroundColor: theme.palette.background.paper,
  border: `1px dashed ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

interface KnowledgeBaseItem {
  id: string
  name: string
  type: 'folder' | 'file'
  children?: KnowledgeBaseItem[]
  selected?: boolean
}

interface DataSource {
  id: string;
  name: string;
  source_type: string;
  is_connected: boolean;
  raw_size_bytes: number;
  document_count: number;
  selected?: boolean;
}

// Add these interfaces at the top with other interfaces
interface AgentCreateData {
  name: string;
  description: string;
  is_private: boolean;
  welcome_message: string;
  instructions: string;
  base_model: string;
  category: string;
  reference_enabled: boolean;
  knowledge_base_ids?: string[];
}

export default function CreateAgentPage() {
  // Get the agent ID from the URL query params if we're editing
  const searchParams = useSearchParams()
  const agentId = searchParams.get('id')
  const isEditing = !!agentId
  const router = useRouter()
  const { data: session } = useSession()

  // Initialize state with existing agent data if editing
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [baseModel, setBaseModel] = useState('claude-4')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [instructions, setInstructions] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [referenceEnabled, setReferenceEnabled] = useState(false)
  const [category, setCategory] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<string[]>([])
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [isLoadingDataSources, setIsLoadingDataSources] = useState(true)
  const [dataSourceError, setDataSourceError] = useState<string | null>(null)

  // Load existing agent data on component mount if editing
  useEffect(() => {
    if (isEditing && agentId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })
        .then(res => res.json())
        .then(agent => {
          setName(agent.name)
          setDescription(agent.description)
          setIsPrivate(agent.is_private)
          setBaseModel(agent.base_model)
          setWelcomeMessage(agent.welcome_message)
          setInstructions(agent.instructions)
          setCategory(agent.category)
          setReferenceEnabled(agent.reference_enabled)
          if (agent.avatar_base64) {
            setAvatarUrl(`data:image/jpeg;base64,${agent.avatar_base64}`)
          }
          // Load knowledge bases if needed
        })
    }
  }, [isEditing, agentId, session])

  // Load data sources
  useEffect(() => {
    const fetchDataSources = async () => {
      if (!session?.user?.accessToken) return;
      
      try {
        setIsLoadingDataSources(true);
        setDataSourceError(null);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data-sources`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data sources');
        }

        const data = await response.json();
        // Add selected property to each data source
        const sourcesWithSelection = data.map((source: DataSource) => ({
          ...source,
          selected: selectedKnowledgeBases.includes(source.id)
        }));
        setDataSources(sourcesWithSelection);
      } catch (error) {
        console.error('Error fetching data sources:', error);
        setDataSourceError('Failed to load data sources');
      } finally {
        setIsLoadingDataSources(false);
      }
    };

    fetchDataSources();
  }, [session, selectedKnowledgeBases]);

  const models = [
    { value: 'claude-3.5', label: 'Anthropic Claude-3.5' },
    { value: 'claude-3.7', label: 'Anthropic Claude-3.7' },
    { value: 'gpt4', label: 'GPT-4' },
    { value: 'gpt4o', label: 'GPT-4o' },
    { value: 'o1-mini', label: 'GPT O1-mini' },
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'mistral', label: 'Mistral' },
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'perplexity', label: 'Perplexity AI' },
    { value: 'meta', label: 'Meta: llama. 3.2 1B' },
    { value: 'huggingface', label: 'Hugging Face' },
  ]

  const availableCategories = [
    "Sales",
    "Tech",
    "Marketing",
    "Operations",
    "Business Development",
    "HR",
    "Customer Support",
    "Research",
    "Personal",
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setProfileImage(event.target.files[0])
    }
  }

  const handleKnowledgeBaseToggle = (id: string) => {
    console.log('Toggling knowledge base:', id)
    // Find and log the data source details
    const source = dataSources.find(ds => ds.id === id)
    if (source) {
      console.log('Data source details:', {
        id: source.id,
        name: source.name,
        type: source.source_type,
        size: formatSize(source.raw_size_bytes, source.document_count),
        isConnected: source.is_connected
      })
    }
    setSelectedKnowledgeBases(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleSave = async () => {
    try {
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/agents/${agentId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/agents`

      const agentData: AgentCreateData = {
        name,
        description,
        is_private: isPrivate,
        welcome_message: welcomeMessage,
        instructions,
        base_model: baseModel,
        category,
        reference_enabled: referenceEnabled,
        knowledge_base_ids: selectedKnowledgeBases
      }

      const formData = new FormData()
      formData.append('agent_data', JSON.stringify(agentData))

      if (profileImage) {
        formData.append('avatar', profileImage)
      }

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to save agent')
      }

      router.push('/dashboard/my-agents')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save agent. Check console for details.')
    }
  }

  const handleOpenChat = () => {
    if (isEditing) {
      router.push(`/dashboard/chat/${agentId}`)
    }
  }

  return (
    <Box sx={{
      p: 4,
      maxWidth: '1200px',
      margin: '0 auto',
      // bgcolor: '#F6F9FC',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4
      }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {isEditing ? 'Edit Agent' : 'Agent Settings'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Agent Name
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <ActionButton
            variant="contained"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
            onClick={handleSave}
          >
            Save
          </ActionButton>

          <ActionButton
            variant="outlined"
            endIcon={<OpenInNewIcon />}
            onClick={handleOpenChat}
            disabled={!isEditing}
            sx={{
              border: '1px solid black',
              color: 'black',
              '&:hover': {
                border: '1px solid black',
                bgcolor: 'action.hover',
              },
            }}
          >
            Open chat
          </ActionButton>
        </Box>
      </Box>

      {/* General Information Section */}
      <StyledSection>
        <Typography variant="h6" className="section-title">
          General Information
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            sx={{ maxWidth: 800 }}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            fullWidth
            sx={{ maxWidth: 800 }}
            helperText="Helps team members understand what the agent is for."
          />

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 800,
            mt: 2
          }}>
            <Box>
              <Typography variant="subtitle1">
                Private
              </Typography>
              <Typography variant="body2" color="text.secondary">
                When enabled the AI agent will only be shown to you. If disabled, the Agent will be available to anyone in your organization.
              </Typography>
            </Box>
            <Switch
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
          </Box>
        </Box>
      </StyledSection>

      {/* Welcome Message Section */}
      <StyledSection>
        <Typography variant="h6" className="section-title">
          Welcome Message
        </Typography>

        <TextField
          label="Message"
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          fullWidth
          sx={{ maxWidth: 800 }}
          placeholder="Set a welcome message for your agent."
        />
      </StyledSection>

      {/* Profile Picture Section */}
      <StyledSection>
        <Typography variant="h6" className="section-title">
          Profile Picture
        </Typography>

        <input
          type="file"
          accept="image/*"
          id="profile-image-upload"
          hidden
          onChange={handleImageUpload}
        />
        <label htmlFor="profile-image-upload">
          <ImageUploadButton>
            {profileImage ? (
              <Box
                component="img"
                src={URL.createObjectURL(profileImage)}
                alt="Profile preview"
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : avatarUrl ? (
              <Box
                component="img"
                src={avatarUrl}
                alt="Profile preview"
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <>
                <AddIcon sx={{ mb: 1 }} />
                <Typography variant="body2" align="center">
                  Upload<br />image
                </Typography>
              </>
            )}
          </ImageUploadButton>
        </label>
      </StyledSection>

      {/* Instructions Section */}
      <StyledSection>
        <Typography variant="h6" className="section-title">
          Instructions
        </Typography>

        <Box sx={{ maxWidth: 800 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These instructions will help the assistant perform based on specific tasks or instructions.
          </Typography>

          <TextField
            multiline
            rows={6}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            fullWidth
            placeholder="Eg., You are an expert on sales with updated knowledge from our competitors.

You will help analyze information, and provide advice to boost company revenue."
          />
        </Box>
      </StyledSection>

      {/* Model Section */}
      <StyledSection>
        <Typography variant="h6" className="section-title">
          Model
        </Typography>

        <FormControl sx={{ maxWidth: 800, width: '100%' }}>
          <InputLabel>Base Model</InputLabel>
          <Select
            value={baseModel}
            onChange={(e) => setBaseModel(e.target.value)}
            label="Base Model"
          >
            {models.map((model) => (
              <MenuItem key={model.value} value={model.value}>
                {model.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </StyledSection>

      {/* Categories Section */}
      <StyledSection>
        <Typography variant="h6" className="section-title">
          Category
        </Typography>

        <FormControl sx={{ maxWidth: 800, width: '100%' }}>
          <InputLabel>Select Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label="Select Category"
          >
            {availableCategories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </StyledSection>

      {/* Knowledge Base Reference Section */}
      <StyledSection>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3
        }}>
          <Box>
            <Typography variant="h6" className="section-title" sx={{ mb: 1 }}>
              Knowledge Base Reference
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 800 }}>
              If this feature is enabled the AI agent will reference your knowledge base and data to answer questions.
              Useful for HR, or other support related functions.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 800, mt: 2 }}>
              If it is disabled, the agent will not reference the knowledge base. Useful for producing high volume content
              like marketing or sales assistants. *Tip: use the / in chat to reference your knowledge base at anytime.
            </Typography>
          </Box>
          <Switch
            checked={referenceEnabled}
            onChange={(e) => setReferenceEnabled(e.target.checked)}
          />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Select your agent's knowledge base
          </Typography>

          <Box sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            <Box sx={{
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography>
                All files ({dataSources.length})
              </Typography>
              {isLoadingDataSources && (
                <CircularProgress size={20} />
              )}
            </Box>

            {dataSourceError ? (
              <Box sx={{ p: 2, color: 'error.main' }}>
                <Typography>{dataSourceError}</Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                {dataSources.map((source) => (
                  <Box
                    key={source.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      gap: 1,
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => handleKnowledgeBaseToggle(source.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      {source.source_type === 'file_upload' ? (
                        <InsertDriveFileIcon sx={{ color: 'text.secondary' }} />
                      ) : (
                        <FolderIcon sx={{ color: 'text.secondary' }} />
                      )}
                      <Box>
                        <Typography>{source.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatSize(source.raw_size_bytes, source.document_count)}
                        </Typography>
                      </Box>
                    </Box>
                    {source.selected && <CheckIcon sx={{ color: 'primary.main' }} />}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </StyledSection>
    </Box>
  )
}

// Utility function to format size
const formatSize = (bytes: number, documentCount: number) => {
  if (!bytes && !documentCount) return "No data";
  
  const parts = [];
  if (bytes) {
    parts.push(formatBytes(bytes));
  }
  if (documentCount) {
    parts.push(`${documentCount.toLocaleString()} documents`);
  }
  
  return parts.join(' • ');
};

const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
