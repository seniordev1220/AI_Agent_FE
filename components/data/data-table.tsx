"use client"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import Image from "next/image"

interface DataSource {
  id: string
  icon: string
  name: string
  status: "verified" | "outdated" | "to_verify" | "syncing"
  size: string
  owner: string
  lastSync: string
}

const dataSources: DataSource[] = [
  {
    id: "1",
    icon: "/icons/software.png",
    name: "Software",
    status: "verified",
    size: "1 MB",
    owner: "Jeff Sutherland",
    lastSync: "3 days ago"
  },
  {
    id: "2",
    icon: "/icons/pdf.png",
    name: "PDF file insurance",
    status: "outdated",
    size: "5.6 MB",
    owner: "Alice Young",
    lastSync: "6 months ago"
  },
  {
    id: "3",
    icon: "/icons/google-drive.png",
    name: "Sales prospect list",
    status: "verified",
    size: "1 GB",
    owner: "Rahul G",
    lastSync: "Syncing"
  },
  // Add more data sources as needed
]

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "verified":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "outdated":
      return <XCircle className="h-5 w-5 text-red-500" />
    case "to_verify":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />
    case "syncing":
      return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
    default:
      return null
  }
}

const StatusText = ({ status }: { status: string }) => {
  switch (status) {
    case "verified":
      return "Verified"
    case "outdated":
      return "Outdated"
    case "to_verify":
      return "To verify"
    case "syncing":
      return "Syncing"
    default:
      return status
  }
}

export function DataTable() {
  return (
    <div className="bg-white rounded-lg shadow">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Name</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Size</th>
            <th className="text-left p-4">Owner</th>
            <th className="text-left p-4">Last sync</th>
          </tr>
        </thead>
        <tbody>
          {dataSources.map((source) => (
            <tr key={source.id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8">
                    <Image
                      src={source.icon}
                      alt={source.name}
                      width={32}
                      height={32}
                    />
                  </div>
                  <span>{source.name}</span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <StatusIcon status={source.status} />
                  <span>{StatusText({ status: source.status })}</span>
                </div>
              </td>
              <td className="p-4">{source.size}</td>
              <td className="p-4">{source.owner}</td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <span>{source.lastSync}</span>
                  {source.status === "syncing" && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
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