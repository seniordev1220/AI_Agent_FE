"use client";
import { Plus, FileCode, Image as ImageIcon, ArrowRight, Bold, Italic, Code, X } from "lucide-react";
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
  onSend?: (message: string) => void;
  onFileUpload?: (file: File) => Promise<string>;
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

export function MessageInput({ onSend, onFileUpload }: MessageInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
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
        if (event.key === 'Enter' && (event.shiftKey || event.metaKey)) {
          return false;
        }
        
        if (event.key === 'Enter') {
          event.preventDefault();
          if (editor && editor.getHTML().trim()) {
            onSend?.(editor.getHTML().trim());  // Send HTML content instead of plain text
            editor.commands.setContent('');
            const element = editor.view.dom as HTMLElement;
            element.style.height = '40px';
          }
          return true;
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

    onSend?.(editor.getHTML().trim()); // Send HTML content instead of plain text
    editor.commands.setContent('');
  };

  const handleImageGeneration = async () => {
    if (!imagePrompt) return;
    
    setIsGenerating(true);
    try {
      console.log('Sending request to generate image...');
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received image URL:', data.imageUrl);
      
      if (!data.imageUrl) {
        throw new Error('No image URL received');
      }
      
      setGeneratedImage(data.imageUrl);
    } catch (error) {
      console.error('Failed to generate image:', error);
      // You might want to show an error message to the user
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const insertGeneratedImage = () => {
    if (generatedImage && editor) {
      // Insert the image with specific styling
      const imageHtml = `<img src="${generatedImage}" alt="${imagePrompt}" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" />`;
      
      // If there's existing content, add a line break before the image
      const currentContent = editor.getHTML().trim();
      const newContent = currentContent 
        ? `${currentContent}<br/>${imageHtml}` 
        : imageHtml;
      
      editor.commands.setContent(newContent);
      
      // Send the message immediately
      onSend?.(newContent);
      
      // Clear the editor and reset states
      editor.commands.setContent('');
      setIsImageModalOpen(false);
      setGeneratedImage(null);
      setImagePrompt("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setIsUploading(true);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload file to /api/upload-file
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      
      // Insert file link into editor
      if (data.url && editor) {
        const fileHtml = `<p>📎 <a href="${data.url}" target="_blank" rel="noopener noreferrer">${file.name}</a></p>`;
        editor.commands.setContent(editor.getHTML() + fileHtml);
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      setIsFileModalOpen(false);
      setSelectedFile(null);
    }
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
          <div className="bg-white rounded-lg border border-gray-200">
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
                  onClick={() => setIsFileModalOpen(true)}
                  className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500"
                >
                  <FileCode className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Send Button */}
              <Button
                type="submit"
                size="icon"
                className="bg-transparent hover:bg-gray-100 text-gray-500 h-8 w-8"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>

        {/* Add hint text */}
        <div className="text-center text-sm text-gray-500 mt-2">
          <p>Type / to reference information in the knowledge base</p>
          <p>Type @ to mention an AI Agent</p>
        </div>
      </div>

      {/* Image Generation Modal */}
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
            {generatedImage && (
              <div className="relative">
                <img
                  src={generatedImage}
                  alt={imagePrompt}
                  className="w-full rounded-lg"
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsImageModalOpen(false)}
              >
                Cancel
              </Button>
              {generatedImage ? (
                <Button onClick={insertGeneratedImage}>Insert Image</Button>
              ) : (
                <Button
                  onClick={handleImageGeneration}
                  disabled={isGenerating || !imagePrompt}
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isFileModalOpen} onOpenChange={setIsFileModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
              disabled={isUploading}
            />
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsFileModalOpen(false)}
                disabled={isUploading}
              >
                Cancel
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