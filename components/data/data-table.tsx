"use client"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import Image from "next/image"

interface DataSource {
  id: string
  icon: string
  name: string
  status: "Verified" | "Outdated" | "Syncing"
  size: string
  owner: string
  lastSync: string
}

const dataSources: DataSource[] = [
  {
    id: "1",
    icon: "/icons/software.png",
    name: "Software",
    status: "Verified",
    size: "1 MB",
    owner: "Jeff Sutherland",
    lastSync: "3 days ago"
  },
  {
    id: "2",
    icon: "/icons/pdf.png",
    name: "PDF file insurance",
    status: "Outdated",
    size: "5.6 MB",
    owner: "Alice Young",
    lastSync: "6 months ago"
  },
  {
    id: "3",
    icon: "/icons/google-drive.png",
    name: "Sales prospect list",
    status: "Verified",
    size: "1 GB",
    owner: "Rahul G",
    lastSync: "Syncing"
  },
  // Add more data sources as needed
]

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "Verified":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "Outdated":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "Syncing":
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    default:
      return null
  }
}

const StatusText = ({ status }: { status: string }) => {
  switch (status) {
    case "Verified":
      return "Verified"
    case "Outdated":
      return "Outdated"
    case "Syncing":
      return "Syncing"
    default:
      return status
  }
}

export function DataTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 text-sm font-medium text-gray-500">Name</th>
            <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
            <th className="text-left p-4 text-sm font-medium text-gray-500">Size</th>
            <th className="text-left p-4 text-sm font-medium text-gray-500">Owner</th>
            <th className="text-left p-4 text-sm font-medium text-gray-500">Last sync</th>
          </tr>
        </thead>
        <tbody>
          {dataSources.map((source) => (
            <tr key={source.id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 relative flex-shrink-0">
                    <Image
                      src={source.icon}
                      alt={source.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {source.name}
                  </span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <StatusIcon status={source.status} />
                  <span className="text-sm">{source.status}</span>
                </div>
              </td>
              <td className="p-4 text-sm">{source.size}</td>
              <td className="p-4">
                <span className="text-sm truncate max-w-[150px] block">
                  {source.owner}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{source.lastSync}</span>
                  {source.status === "Syncing" && (
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 