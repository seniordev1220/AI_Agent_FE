"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { ConnectSourceModal } from "../connect-source-modal"

interface DataSourceOption {
  id: string
  name: string
  icon: string
  description?: string
}

const dataSourceOptions: DataSourceOption[] = [
  {
    id: "airtable",
    name: "Airtable",
    icon: "/data_icon/airtable.svg",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    icon: "/data_icon/dropbox.svg",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    icon: "/data_icon/google-drive.svg",
  },
  {
    id: "slack",
    name: "Slack",
    icon: "/data_icon/slack.svg",
  },
  {
    id: "upload",
    name: "Upload Files",
    icon: "/data_icon/upload.svg",
    description: "max 20MB per file"
  },
  {
    id: "github",
    name: "GitHub",
    icon: "/data_icon/github.svg",
  },
  {
    id: "onedrive",
    name: "One Drive",
    icon: "/data_icon/onedrive.svg",
  },
  {
    id: "sharepoint",
    name: "Sharepoint",
    icon: "/data_icon/sharepoint.svg",
  },
  {
    id: "web-scraper",
    name: "Web Scraper",
    icon: "/data_icon/web-scraper.svg",
    description: "max 100 lines to sync"
  },
  {
    id: "snowflake",
    name: "Snowflake",
    icon: "/data_icon/snowflake.svg",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    icon: "/data_icon/salesforce.svg",
  },
  {
    id: "hubspot",
    name: "Hubspot",
    icon: "/data_icon/hubspot.svg",
  },
]

interface AddDataSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddDataSourceDialog({ open, onOpenChange }: AddDataSourceDialogProps) {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const handleSourceClick = (source: DataSourceOption) => {
    setSelectedSource(source.name);
    setIsConnectModalOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Connect Your Data Sources</DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {dataSourceOptions.map((source) => (
              <button
                key={source.id}
                className="flex flex-col items-center justify-center p-4 rounded-lg border hover:border-gray-400 transition-colors"
                onClick={() => handleSourceClick(source)}
              >
                <div className="w-12 h-12 relative mb-2">
                  <Image
                    src={source.icon}
                    alt={source.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-medium">{source.name}</span>
                {source.description && (
                  <span className="text-xs text-gray-500">{source.description}</span>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ConnectSourceModal
        isOpen={isConnectModalOpen}
        onClose={() => {
          setIsConnectModalOpen(false);
          setSelectedSource(null);
        }}
        selectedSource={selectedSource}
      />
    </>
  )
} 