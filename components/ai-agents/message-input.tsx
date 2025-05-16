"use client";
import { Plus, FileCode, Image as ImageIcon, ArrowRight, Bold, Italic, Code, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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

interface MessageInputProps {
  onSend?: (message: string) => void;
}

// Add this utility function at the top of the file
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

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

  const insertGeneratedImage = async () => {
    if (generatedImage && editor) {
      try {
        // Convert image to base64
        const base64Image = await imageUrlToBase64(generatedImage);
        
        // Insert the image with specific styling
        const imageHtml = `<img src="${base64Image}" alt="${imagePrompt}" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" />`;
        
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
      } catch (error) {
        console.error('Error handling image insertion:', error);
        alert('Failed to process the image. Please try again.');
      }
    }
  };

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
    </div>
  );
}