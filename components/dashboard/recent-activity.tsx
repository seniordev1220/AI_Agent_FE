import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your AI agents' recent activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center text-white font-medium">
                AI
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Agent {i} completed a task</h4>
                  <span className="text-xs text-gray-500">{i}h ago</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Processed {i * 10} customer inquiries and generated {i * 2} reports
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
