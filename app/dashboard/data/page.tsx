"use client"
import { DataTable } from "@/components/data/data-table"
import { AddDataSourceDialog } from "@/components/data/add-data-source-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"

export default function DataPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Data & Knowledge Base</h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">
          Connect your data sources and customize agents to have information based on your knowledge base.
        </p>
      </div>

      <Button 
        className="w-full md:w-auto bg-black text-white hover:bg-gray-800"
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" /> Add data source
      </Button>

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="min-w-[800px] md:w-full px-4 md:px-0">
          <DataTable />
        </div>
      </div>

      <AddDataSourceDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
