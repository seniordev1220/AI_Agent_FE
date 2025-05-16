"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Bot, Clock } from "lucide-react"
import { useSession } from "next-auth/react";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function DashboardStats() {

  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Guest";
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl">
          Welcome, <span className="text-blue-500">{firstName}</span>
        </h1>
      </div>

      {/* Overview Section */}
      <div>
        <h2 className="text-xl font-medium mb-4">Your Overview</h2>
        <div className="flex gap-4 mb-4">
          <button className="bg-blue-500 text-white px-6 py-2 rounded-full">
            All time
          </button>
          <button className="bg-white text-gray-700 px-6 py-2 rounded-full flex items-center gap-2">
            Last 30 days
            <span className="text-gray-400">↑↓</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* TOP AI Agents Used */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col h-[200px]">
          <h3 className="text-lg font-medium mb-4">TOP AI Agents Used</h3>
          <div className="space-y-3 flex-grow">
            <div className="flex justify-between">
              <span>Sales Support Agent</span>
              <span>892435</span>
            </div>
            <div className="flex justify-between">
              <span>HR Onboarding Agent</span>
              <span>50372</span>
            </div>
            <div className="flex justify-between">
              <span>Tech Writer</span>
              <span>432</span>
            </div>
          </div>
          <a href="#" className="text-blue-500 mt-auto">View More</a>
        </div>

        {/* Users */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col h-[200px]">
          <h3 className="text-lg font-medium mb-4">Users</h3>
          <div className="text-4xl font-bold flex-grow">5</div>
          <a href="#" className="text-blue-500 mt-auto">View More</a>
        </div>

        {/* Token Usage */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col h-[200px]">
          <h3 className="text-lg font-medium mb-4">Estimated Token Usage</h3>
          <div className="text-4xl font-bold flex-grow">101,796,304</div>
          <a href="#" className="text-blue-500 mt-auto">View More</a>
        </div>

        {/* Message Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col h-[200px]">
          <h3 className="text-lg font-medium mb-4">Message Activity</h3>
          <div className="text-4xl font-bold flex-grow">94852</div>
          <a href="#" className="text-blue-500 mt-auto">View More</a>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mt-8">
        <h2 className="text-xl font-medium mb-6">Summary</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token Usage Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Estimated Token Usage by Users</h3>
            <div className="space-y-4">
              <div style={{ height: '200px' }}>
                <Doughnut
                  data={{
                    labels: ['sara@xyz.com', 'john.a@xyz.com', 'lil.fn@xyz.com', 'admin@xyz.com'],
                    datasets: [{
                      data: [54.9, 27.9, 5.2, 0.2],
                      backgroundColor: [
                        '#7DD3FC', // Light blue
                        '#2563EB', // Blue
                        '#FDE68A', // Light yellow
                        '#93C5FD', // Very light blue
                      ],
                      borderWidth: 0,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
              <div className="space-y-2 mt-4">
                {[
                  { email: 'sara@xyz.com', tokens: '54.9M' },
                  { email: 'john.a@xyz.com', tokens: '279K' },
                  { email: 'lil.fn@xyz.com', tokens: '5.2K' },
                  { email: 'admin@xyz.com', tokens: '0.2K' },
                ].map((user) => (
                  <div key={user.email} className="flex justify-between">
                    <span>{user.email}</span>
                    <span>{user.tokens}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messages Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Messages Sent by Users</h3>
            <div className="space-y-4">
              <div style={{ height: '200px' }}>
                <Bar
                  data={{
                    labels: ['27/01/2025', '02/02/2025', '08/02/2025', '14/02/2025', '20/02/2025', '26/02/2025'],
                    datasets: [{
                      data: [80, 120, 160, 100, 60, 180],
                      backgroundColor: '#2563EB',
                      borderRadius: 4,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 240,
                        ticks: {
                          stepSize: 60
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
              <div className="space-y-2 mt-4">
                {[
                  { email: 'sara@xyz.com', messages: '4.9K' },
                  { email: 'john.a@xyz.com', messages: '1.5K' },
                  { email: 'lil.fn@xyz.com', messages: '77' },
                  { email: 'admin@xyz.com', messages: '9' },
                ].map((user) => (
                  <div key={user.email} className="flex justify-between">
                    <span>{user.email}</span>
                    <span>{user.messages}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}