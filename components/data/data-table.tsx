"use client"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { format, formatDistanceToNow } from 'date-fns'
import { useSession } from "next-auth/react"


interface DataSource {
  id: string
  icon: string
  name: string
  status: "Verified" | "Outdated" | "Syncing" | "To verify"
  size: string
  owner: string
  lastSync: string
}

export function DataTable() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { data: session } = useSession()

  const loadDataSources = () => {
    const savedSources = localStorage.getItem('dataSources');
    if (savedSources) {
      const parsedSources = JSON.parse(savedSources);
      setDataSources(parsedSources);
    }
  };

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

  useEffect(() => {
    loadDataSources();

    // Add event listener for new sources
    const handleSourceAdded = () => {
      loadDataSources();
    };

    window.addEventListener('sourceAdded', handleSourceAdded);

    // Cleanup
    return () => {
      window.removeEventListener('sourceAdded', handleSourceAdded);
    };
  }, []);

  // Function to format the lastSync timestamp
  const formatLastSync = (timestamp: string) => {
    try {
      if (timestamp === "Just now") return timestamp;
      const date = new Date(timestamp);
      
      // Show exact date/time when hovering
      const exactDateTime = format(date, 'PPpp'); // e.g., "Apr 29, 2023, 3:00 PM"
      const relativeTime = formatDistanceToNow(date, { addSuffix: true }); // e.g., "2 hours ago"
      
      return (
        <span title={exactDateTime}>
          {relativeTime}
        </span>
      );
    } catch {
      return timestamp;
    }
  };

  const totalPages = Math.ceil(dataSources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = dataSources.slice(startIndex, endIndex);

  const handleStatusChange = (sourceId: string, newStatus: DataSource['status']) => {
    const loginedUser = session?.user?.name || 'Unknown User';
    setDataSources(prev => 
      prev.map(source =>
        source.id === sourceId 
          ? { 
              ...source, 
              status: newStatus,
              owner: loginedUser,
              lastSync: "Just now"
            } 
          : source
      )
    );
    setActiveDropdown(null);
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
              <td className="p-4 relative">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setActiveDropdown(activeDropdown === source.id ? null : source.id)}
                >
                  <StatusIcon status={source.status} />
                  <span className="text-sm">{source.status}</span>
                </div>
                
                {activeDropdown === source.id && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border">
                    <div className="py-1">
                      <div className="px-3 py-2 text-sm text-gray-500 border-b">Change status:</div>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => handleStatusChange(source.id, "Verified")}
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Mark as verified</span>
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => handleStatusChange(source.id, "Outdated")}
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>Mark out of date</span>
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => handleStatusChange(source.id, "To verify")}
                      >
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span>Mark to verify</span>
                      </button>
                    </div>
                  </div>
                )}
              </td>
              <td className="p-4 text-sm">{source.size}</td>
              <td className="p-4">
                <span className="text-sm truncate max-w-[150px] block">
                  {source.owner}
                </span>
              </td>
              <td className="p-4 hover:cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{formatLastSync(source.lastSync)}</span>
                  {source.status === "Syncing" && (
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                </div>
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