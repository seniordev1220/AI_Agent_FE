"use client";
import { Plus, FileCode, Image as ImageIcon, ArrowRight, Bold, Italic, Code, X, Paperclip, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import { useSession } from "next-auth/react";
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';

interface MessageInputProps {
  onSend?: (message: string, files?: File[], isImageGeneration?: boolean, imagePrompt?: string) => void;
  onWebSearch?: (query: string) => void;
}

interface DataSource {
  id: string;
  name: string;
  description?: string;
}

interface Agent {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
}

export function MessageInput({ onSend, onWebSearch }: MessageInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mentionAnchor, setMentionAnchor] = useState<null | HTMLElement>(null);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionType, setMentionType] = useState<"agent" | "knowledge" | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastCaretPosition = useRef<number>(0);
  const { data: session } = useSession();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isWebSearchMode, setIsWebSearchMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!mentionType || !session?.user?.accessToken) return;
      
      setIsLoading(true);
      try {
        const endpoint = mentionType === 'agent' 
          ? `${process.env.NEXT_PUBLIC_API_URL}/agents` 
          : `${process.env.NEXT_PUBLIC_API_URL}/data-sources`;
          
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        if (mentionType === 'agent') {
          setAgents(data);
        } else {
          setDataSources(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mentionType, session]);

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onFocus: () => {
      setIsFocused(true);
    },
    onBlur: () => {
      setIsFocused(false);
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.metaKey) {
          event.preventDefault();
          if (editor && editor.getHTML().trim()) {
            if (isWebSearchMode) {
              onWebSearch?.(editor.getHTML().trim());
            } else {
              onSend?.(editor.getHTML().trim(), selectedFiles, false, "");
            }
            editor.commands.setContent('');
            setSelectedFiles([]);
            setIsWebSearchMode(false);
            const element = editor.view.dom as HTMLElement;
            element.style.height = '40px';
          }
          return true;
        }
        
        if (event.key === 'Enter' && (event.shiftKey || event.metaKey)) {
          return false;
        }

        // Handle mention triggers
        if (event.key === '/' || event.key === '@') {
          const element = editor?.view.dom as HTMLElement;
          setMentionAnchor(element);
          setMentionType(event.key === '@' ? 'agent' : 'knowledge');
          setMentionSearch("");
          return false;
        }

        // Close mention popup on escape
        if (event.key === 'Escape' && mentionAnchor) {
          setMentionAnchor(null);
          setMentionType(null);
          return true;
        }

        return false;
      },
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-h-[200px] overflow-y-auto',
      },
    },
    onCreate: ({ editor }) => {
      const element = editor.view.dom as HTMLElement;
      element.style.height = '40px'; // Set initial height
    },
    onUpdate: ({ editor }) => {
      const element = editor.view.dom as HTMLElement;
      element.style.height = '40px'; // Reset to minimum
      const newHeight = Math.min(element.scrollHeight, 200); // Cap at max height
      element.style.height = `${newHeight}px`;

      // Update mention search
      if (mentionType) {
        const currentPosition = editor.state.selection.from;
        const text = editor.state.doc.textBetween(
          Math.max(0, currentPosition - 100),
          currentPosition,
          "\n"
        );
        const lastTrigger = mentionType === 'agent' ? '@' : '/';
        const match = text.match(new RegExp(`${lastTrigger}([^${lastTrigger}\\s]*)$`));
        if (match) {
          setMentionSearch(match[1]);
        } else {
          setMentionAnchor(null);
          setMentionType(null);
        }
      }
    },
  });

  // Add these helper functions
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleCode = () => editor?.chain().focus().toggleCode().run();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor || !editor.getHTML().trim()) return;

    if (isWebSearchMode) {
      // Call web search with the input content
      onWebSearch?.(editor.getHTML().trim());
    } else {
      // Normal message send
      onSend?.(editor.getHTML().trim(), selectedFiles, false, "");
    }
    
    // Clear input and reset mode
    editor.commands.setContent('');
    setSelectedFiles([]);
    setIsWebSearchMode(false);
  };

  const handleImageGeneration = async () => {
    if (!imagePrompt) return;
    
    // Instead of generating the image here, we'll send it to the parent component
    if (onSend) {
      onSend("", [], true, imagePrompt);
      setIsImageModalOpen(false);
      setImagePrompt("");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMentionSelect = (item: Agent | DataSource) => {
    if (!editor) return;

    const currentPosition = editor.state.selection.from;
    const prefix = mentionType === 'agent' ? '@' : '/';
    const searchText = `${prefix}${mentionSearch}`;
    const startPosition = currentPosition - searchText.length;

    // Replace the search text with the selected item
    editor
      .chain()
      .focus()
      .setTextSelection(startPosition)
      .deleteRange({ from: startPosition, to: currentPosition })
      .insertContent(`${prefix}${item.name} `)
      .run();

    setMentionAnchor(null);
    setMentionType(null);
  };

  // Filter items based on search
  const filteredItems = mentionType === 'agent'
    ? agents.filter(agent => agent.name.toLowerCase().includes(mentionSearch.toLowerCase()))
    : dataSources.filter(source => source.name.toLowerCase().includes(mentionSearch.toLowerCase()));

  return (
    <div className="w-full">
      <div>
        <form onSubmit={handleSubmit}>
          <div className={`bg-white rounded-lg border border-gray-200 ${isWebSearchMode ? 'ring-2 ring-blue-500' : ''}`}>
            {/* File Preview Section */}
            {selectedFiles.length > 0 && (
              <div className="px-3 py-2 border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-1"
                    >
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show search mode indicator */}
            {isWebSearchMode && (
              <div className="px-3 py-1 bg-blue-50 text-blue-700 text-sm">
                Web Search Mode
              </div>
            )}

            {/* Rich Text Editor */}
            <EditorContent
              editor={editor}
              className="min-h-[40px] max-h-[200px] p-2 focus:outline-none focus-visible:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus-visible:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror]:overflow-y-auto"
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-between px-2 py-1 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleBold}
                  className={`p-1.5 hover:bg-gray-100 rounded-md ${
                    editor?.isActive('bold') ? 'bg-gray-100 text-black' : 'text-gray-500'
                  }`}
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={toggleItalic}
                  className={`p-1.5 hover:bg-gray-100 rounded-md ${
                    editor?.isActive('italic') ? 'bg-gray-100 text-black' : 'text-gray-500'
                  }`}
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={toggleCode}
                  className={`p-1.5 hover:bg-gray-100 rounded-md ${
                    editor?.isActive('code') ? 'bg-gray-100 text-black' : 'text-gray-500'
                  }`}
                >
                  <Code className="h-4 w-4" />
                </button>
                <div className="w-px h-4 bg-gray-200 mx-1" /> {/* Separator */}
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsWebSearchMode(!isWebSearchMode)}
                  className={`p-1.5 hover:bg-gray-100 rounded-md ${
                    isWebSearchMode ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
                  }`}
                >
                  <Search className="h-4 w-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Send Button */}
              <Button
                type="submit"
                size="icon"
                className={`h-8 w-8 ${
                  isWebSearchMode 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-transparent hover:bg-gray-100 text-gray-500'
                }`}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>

        {/* Add hint text */}
        <div className="text-center text-sm text-gray-500 mt-2">
          {isWebSearchMode ? (
            <p>Enter your search query and press Enter or click the send button</p>
          ) : (
            <>
              <p>Type / to reference information in the knowledge base</p>
              <p>Type @ to mention an AI Agent</p>
            </>
          )}
        </div>
      </div>

      {/* Update Image Generation Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Image</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Input
                id="prompt"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImageModalOpen(false);
                  setImagePrompt("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImageGeneration}
                disabled={!imagePrompt}
              >
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Updated Mention Popup */}
      <Popper
        open={Boolean(mentionAnchor)}
        anchorEl={mentionAnchor}
        placement="top-start"
        style={{ zIndex: 1300 }}
      >
        <Paper elevation={3} sx={{ width: 320, maxHeight: 400, overflow: 'auto' }}>
          <MenuList>
            {isLoading ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading...
              </MenuItem>
            ) : filteredItems.length === 0 ? (
              <MenuItem disabled>
                <ListItemText>No results found</ListItemText>
              </MenuItem>
            ) : (
              filteredItems.map((item) => (
                <MenuItem
                  key={item.id}
                  onClick={() => handleMentionSelect(item)}
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1
                  }}
                >
                  {mentionType === 'agent' && (
                    <ListItemAvatar>
                      <Avatar
                        src={`data:image/png;base64,${(item as Agent).avatar_base64}`}
                        alt={item.name}
                        sx={{ width: 32, height: 32 }}
                      >
                        {item.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    primary={item.name}
                    secondary={item.description}
                    primaryTypographyProps={{
                      sx: { fontWeight: 'medium' }
                    }}
                    secondaryTypographyProps={{
                      sx: { 
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }
                    }}
                  />
                </MenuItem>
              ))
            )}
          </MenuList>
        </Paper>
      </Popper>
    </div>
  );
}