"use client"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { format, formatDistanceToNow } from 'date-fns'
import { useSession } from "next-auth/react"
import { formatBytes } from "@/lib/utils"

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface DataSource {
  id: string;
  name: string;
  source_type: string;
  is_connected: boolean;
  created_at: string;
  updated_at: string;
  owner: string;
  user_id: string;
  raw_size_bytes: number;
  document_count: number;
}

const formatSize = (bytes: number, documentCount: number) => {
  if (!bytes && !documentCount) return "N/A";
  
  const parts = [];
  if (bytes) {
    parts.push(formatBytes(bytes));
  }
  if (documentCount) {
    parts.push(`${documentCount.toLocaleString()} documents`);
  }
  
  return parts.join(' • ');
};

export function DataTable() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { data: session } = useSession()
  const [users, setUsers] = useState<{ [key: string]: User }>({});

  const loadDataSources = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data-sources`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch data sources');
      
      const sources = await response.json();
      setDataSources(sources);
    } catch (error) {
      console.error('Error loading data sources:', error);
    }
  };

  const loadUsers = async (userIds: string[]) => {
    try {
      const uniqueIds = [...new Set(userIds)];
      const promises = uniqueIds.map(id =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${session?.user?.accessToken}`
          }
        }).then(res => res.json())
      );
      
      const usersData = await Promise.all(promises);
      const usersMap = usersData.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
      
      setUsers(usersMap);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const getSourceIcon = (sourceType: string) => {
    const iconMap: { [key: string]: string } = {
      airtable: "/data_icon/airtable.svg",
      dropbox: "/data_icon/dropbox.svg",
      google_drive: "/data_icon/google-drive.svg",
      slack: "/data_icon/slack.svg",
      github: "/data_icon/github.svg",
      one_drive: "/data_icon/onedrive.svg",
      sharepoint: "/data_icon/sharepoint.svg",
      web_scraper: "/data_icon/web.svg",
      snowflake: "/data_icon/snowflake.svg",
      salesforce: "/data_icon/salesforce.svg",
      hubspot: "/data_icon/hubspot.svg"
    };
    return iconMap[sourceType] || "/data_icon/file-icon.svg";
  };

  const StatusIcon = ({ isConnected }: { isConnected: boolean }) => {
    if (isConnected === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (isConnected === false) {
      return <XCircle className="h-4 w-4 text-red-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-orange-500" />
    }
  };

  const getStatusText = (isConnected: boolean | null) => {
    if (isConnected === true) {
      return "Mark as verified";
    } else if (isConnected === false) {
      return "Mark out of date";
    } else {
      return "Mark to verify";
    }
  };

  useEffect(() => {
    if (session?.user?.accessToken) {
      loadDataSources();
    }

    const handleSourceAdded = () => {
      loadDataSources();
    };

    window.addEventListener('sourceAdded', handleSourceAdded);
    return () => {
      window.removeEventListener('sourceAdded', handleSourceAdded);
    };
  }, [session]);

  useEffect(() => {
    if (dataSources.length > 0 && session?.user?.accessToken) {
      const userIds = dataSources.map(source => source.user_id);
      loadUsers(userIds);
    }
  }, [dataSources, session]);

  // Function to format the lastSync timestamp
  const formatLastSync = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const exactDateTime = format(date, 'PPpp');
      const relativeTime = formatDistanceToNow(date, { addSuffix: true });
      
      return (
        <span title={exactDateTime}>
          {relativeTime}
        </span>
      );
    } catch {
      return "Never";
    }
  };

  const totalPages = Math.ceil(dataSources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = dataSources.slice(startIndex, endIndex);
  console.log("&&&&",currentItems)
  const handleStatusChange = async (sourceId: string, isConnected: boolean | null) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data-sources/${sourceId}/connection-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        },
        body: JSON.stringify({
          is_connected: isConnected
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      // Update local state
      setDataSources(prev => 
        prev.map(source =>
          source.id === sourceId 
            ? { ...source, is_connected: isConnected ?? false }
            : source
        )
      );
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getFullName = (userId: string) => {
    const user = users[userId];
    if (!user) return "Loading...";
    return `${user.first_name} ${user.last_name}`.trim() || "Unknown";
  };

  return (
    <div className="bg-white rounded-lg h-[66vh] shadow overflow-hidden">
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
        <tbody className="overflow-y-auto">
          {currentItems.map((source) => (
            <tr key={source.id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 relative flex-shrink-0">
                    <Image
                      src={getSourceIcon(source.source_type)}
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
              <td className="p-4 relative">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setActiveDropdown(activeDropdown === source.id ? null : source.id)}
                >
                  <StatusIcon isConnected={source.is_connected} />
                  <span className="text-sm">{getStatusText(source.is_connected)}</span>
                </div>
                
                {activeDropdown === source.id && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border">
                    <div className="py-1">
                      <div className="px-3 py-2 text-sm text-gray-500 border-b">Change status:</div>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => handleStatusChange(source.id, true)}
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Mark as verified</span>
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => handleStatusChange(source.id, false)}
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>Mark out of date</span>
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => handleStatusChange(source.id, null)}
                      >
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span>Mark to verify</span>
                      </button>
                    </div>
                  </div>
                )}
              </td>
              <td className="p-4">
                <div className="text-sm text-gray-600">
                  {formatSize(source.raw_size_bytes, source.document_count)}
                </div>
              </td>
              <td className="p-4">
                <span className="text-sm truncate max-w-[150px] block">
                  {getFullName(source.user_id)}
                </span>
              </td>
              <td className="p-4">
                <span className="text-sm">
                  {formatLastSync(source.updated_at)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination Controls */}
      <div className="border-t px-4 py-2 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(endIndex, dataSources.length)} of {dataSources.length} entries
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`p-1 rounded ${
              currentPage === 1 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`p-1 rounded ${
              currentPage === totalPages 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};