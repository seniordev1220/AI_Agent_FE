"use client"
import { Box, Typography, Button, TextField, Switch, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material'
import { styled } from '@mui/material/styles'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import FolderIcon from '@mui/icons-material/Folder'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckIcon from '@mui/icons-material/Check'

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

const knowledgeBaseData: KnowledgeBaseItem[] = [
  {
    id: '1',
    name: 'Internal Documents',
    type: 'folder',
    children: [],
    selected: true
  },
  {
    id: '2',
    name: 'Meeting Notes',
    type: 'folder',
    children: [],
  },
  {
    id: '3',
    name: 'Product Documents',
    type: 'folder',
    children: [],
  },
  {
    id: '4',
    name: 'Marketing Documents',
    type: 'folder',
    children: [],
  },
  {
    id: '5',
    name: 'Recruiting Documents',
    type: 'folder',
    children: [],
  },
  {
    id: '6',
    name: 'Human Resources Documents',
    type: 'folder',
    children: [],
    selected: true
  },
  {
    id: '7',
    name: 'Imported Website - 3/22/2024',
    type: 'file',
  },
]

export default function CreateAgentPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [baseModel, setBaseModel] = useState('claude-4')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [instructions, setInstructions] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [referenceEnabled, setReferenceEnabled] = useState(false)
  const [category, setCategory] = useState<string>('')

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
    "Marketing",
    "HR",
    "IT",
    "Customer Support",
    "Operations",
    "Finance",
    "Legal",
    "Research",
    "Development"
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProfileImage(event.target.files[0])
    }
  }

  const handleSave = () => {
    const agent = {
      name,
      description,
      isPrivate,
      welcomeMessage,
      instructions,
      baseModel,
      category,
      id: Date.now().toString(),
    }
    // Get existing agents
    const existing = JSON.parse(localStorage.getItem("myAgents") || "[]")
    // Save new list
    localStorage.setItem("myAgents", JSON.stringify([...existing, agent]))
    // Optionally redirect to /my-agents or show a success message
    window.location.href = "/dashboard/my-agents"
  }

  return (
    <Box sx={{ p: 4, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4 
      }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Agent Settings
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
            sx={{ maxWidth: 600 }}
          />
          
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            fullWidth
            sx={{ maxWidth: 600 }}
            helperText="Helps team members understand what the agent is for."
          />
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            maxWidth: 600,
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
          sx={{ maxWidth: 600 }}
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
            <AddIcon sx={{ mb: 1 }} />
            <Typography variant="body2" align="center">
              Upload<br />image
            </Typography>
          </ImageUploadButton>
        </label>
      </StyledSection>

      {/* Instructions Section */}
      <StyledSection>
        <Typography variant="h6" className="section-title">
          Instructions
        </Typography>
        
        <Box sx={{ maxWidth: 600 }}>
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
        
        <FormControl sx={{ maxWidth: 600, width: '100%' }}>
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
        
        <FormControl sx={{ maxWidth: 600, width: '100%' }}>
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
              bgcolor: 'background.paper'
            }}>
              <Typography>All files (2)</Typography>
            </Box>
            
            <Box sx={{ 
              bgcolor: '#f8f9fa',
              p: 2
            }}>
              {knowledgeBaseData.map((item) => (
          
          <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    gap: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <FolderIcon sx={{ color: 'text.secondary' }} />
                  <Typography sx={{ flex: 1 }}>{item.name}</Typography>
                  {item.type === 'folder' && <ExpandMoreIcon sx={{ color: 'text.secondary' }} />}
                  {item.selected && <CheckIcon sx={{ color: 'primary.main' }} />}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </StyledSection>
    </Box>
  )
}
