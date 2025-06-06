"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Bot, Clock } from "lucide-react"
import { useSession } from "next-auth/react";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DashboardStats {
  total_users: number;
  total_messages: number;
  total_tokens: number;
  top_agents: {
    name: string;
    usage_count: number;
  }[];
}

interface UserTokenUsage {
  email: string;
  token_usage: number;
}

interface DailyMessages {
  date_range: {
    start: string;
    end: string;
  };
  daily_messages: {
    [date: string]: {
      [email: string]: number;
    };
  };
}

export function DashboardStats() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Guest";
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userTokens, setUserTokens] = useState<UserTokenUsage[]>([]);
  const [messageStats, setMessageStats] = useState<DailyMessages | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("all"); // "all" or "30d"

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.accessToken) return;

      try {
        // Fetch main stats
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats?range=${range}`, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        });

        // Fetch user token usage
        const tokenUsageResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/user-token-usage`, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        });

        // Fetch message stats
        const messageStatsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/messages-by-date?days=6`, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        });

        if (!statsResponse.ok || !tokenUsageResponse.ok || !messageStatsResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const [statsData, tokenData, messageData] = await Promise.all([
          statsResponse.json(),
          tokenUsageResponse.json(),
          messageStatsResponse.json()
        ]);

        setStats(statsData);
        setUserTokens(tokenData);
        setMessageStats(messageData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard statistics');
      }
    };

    fetchData();
  }, [session, range]);

  // Format token usage for chart
  const tokenChartData = {
    labels: userTokens?.length ? userTokens.slice(0, 4).map((user: UserTokenUsage) => user.email) : ['No Data'],
    datasets: [{
      data: userTokens?.length ? userTokens.slice(0, 4).map((user: UserTokenUsage) => user.token_usage) : [1],
      backgroundColor: userTokens?.length ? [
        '#7DD3FC', // Light blue
        '#2563EB', // Blue
        '#FDE68A', // Light yellow
        '#93C5FD', // Very light blue
      ] : ['#E5E7EB'], // Gray for empty state
      borderWidth: 0,
    }]
  };

  // Format message stats for chart
  const messageChartData = {
    labels: messageStats?.daily_messages ? Object.keys(messageStats.daily_messages) : ['No Data'],
    datasets: [{
      data: messageStats?.daily_messages ? 
        Object.values(messageStats.daily_messages).map(dayData => 
          Object.values(dayData as Record<string, number>).reduce((sum: number, count: number) => sum + count, 0)
        ) : [0],
      backgroundColor: '#2563EB',
      borderRadius: 4,
    }]
  };

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

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
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <button
            className={`px-4 py-2 rounded ${range === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => setRange("all")}
          >
            All time
          </button>
          <button
            className={`px-4 py-2 rounded border ${range === "30d" ? "bg-blue-600 text-white" : "border-gray-100 text-gray-700"}`}
            onClick={() => setRange("30d")}
          >
            Last 30 days
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TOP AI Agents Used */}
        <div className="bg-[#F6F9FC] p-6 rounded-lg shadow-sm flex flex-col h-[200px]">
          <h3 className="text-lg font-medium mb-4">TOP AI Agents Used</h3>
          <div className="space-y-3 flex-grow">
            {stats?.top_agents?.length ? (
              stats.top_agents.map((agent) => (
                <div key={agent.name} className="flex justify-between">
                  <span>{agent.name}</span>
                  <span>{agent.usage_count.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No agents data available
              </div>
            )}
          </div>
          <a href="#" className="text-blue-500 mt-auto">View More</a>
        </div>

        {/* Users */}
        <div className="bg-[#F6F9FC] p-6 rounded-lg shadow-sm flex flex-col h-[200px]">
          <h3 className="text-lg font-medium mb-4">Users</h3>
          <div className="text-4xl font-bold flex-grow">
            {stats?.total_users ? stats.total_users.toLocaleString() : (
              <div className="flex items-center justify-center h-full text-gray-500 text-xl">
                No users data
              </div>
            )}
          </div>
          <a href="#" className="text-blue-500 mt-auto">View More</a>
        </div>

        {/* Token Usage */}
        <div className="bg-[#F6F9FC] p-6 rounded-lg shadow-sm flex flex-col h-[200px]">
          <h3 className="text-lg font-medium mb-4">Estimated Token Usage</h3>
          <div className="text-4xl font-bold flex-grow">
            {stats?.total_tokens ? stats.total_tokens.toLocaleString() : (
              <div className="flex items-center justify-center h-full text-gray-500 text-xl">
                No token data
              </div>
            )}
          </div>
          <a href="#" className="text-blue-500 mt-auto">View More</a>
        </div>

        {/* Message Activity */}
        <div className="bg-[#F6F9FC] p-6 rounded-lg shadow-sm flex flex-col h-[200px]">
          <h3 className="text-lg font-medium mb-4">Message Activity</h3>
          <div className="text-4xl font-bold flex-grow">
            {stats?.total_messages ? stats.total_messages.toLocaleString() : (
              <div className="flex items-center justify-center h-full text-gray-500 text-xl">
                No messages data
              </div>
            )}
          </div>
          <a href="#" className="text-blue-500 mt-auto">View More</a>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mt-8">
        <h2 className="text-xl font-medium mb-6">Summary</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token Usage Chart */}
          <div className="bg-[#F6F9FC] p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Estimated Token Usage by Users</h3>
            <div className="space-y-4">
              <div style={{ height: '200px' }}>
                <Doughnut
                  data={tokenChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
              <div className="space-y-2 mt-4">
                {userTokens?.length ? (
                  userTokens.slice(0, 4).map((user) => (
                    <div key={user.email} className="flex justify-between">
                      <span>{user.email}</span>
                      <span>{(user.token_usage / 1000).toFixed(1)}K</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">No token usage data available</div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Chart */}
          <div className="bg-[#F6F9FC] p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Messages Sent by Users</h3>
            <div className="space-y-4">
              <div style={{ height: '200px' }}>
                <Bar
                  data={messageChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 20
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
                {userTokens?.length ? (
                  userTokens.slice(0, 4).map((user) => {
                    const userDailyTotal = messageStats ? 
                      Object.values(messageStats.daily_messages).reduce((sum, dayData) => 
                        sum + (dayData[user.email] || 0), 0
                      ) : 0;
                    
                    return (
                      <div key={user.email} className="flex justify-between">
                        <span>{user.email}</span>
                        <span>{userDailyTotal}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500">No message data available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
