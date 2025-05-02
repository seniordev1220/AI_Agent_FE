"use client"
import { DataTable } from "@/components/data/data-table"
import { AddDataSourceDialog } from "@/components/data/add-data-source-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"

export default function DataPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Data & Knowledge Base</h1>
        <p className="text-gray-500 mt-2">
          Connect your data sources and customize agents to have information based on your knowledge base.
        </p>
      </div>

      <Button 
        className="bg-black text-white hover:bg-gray-800"
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" /> Add data source
      </Button>

      <DataTable />

      <AddDataSourceDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
