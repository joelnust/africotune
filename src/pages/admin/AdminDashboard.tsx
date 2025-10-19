import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/common/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI } from '@/services/api';
import { DashboardStats } from '@/types';
import { BarChart3, Users, Music, FileText } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [logSheetTimeline, setLogSheetTimeline] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [users, music, companies, admins, logSheets, pendingProfiles, pendingMusic, allProfiles] = await Promise.all([
          adminAPI.getAllUsers().catch(() => []),
          adminAPI.getAllMusic().catch(() => []),
          adminAPI.getAllCompanies().catch(() => []),
          adminAPI.getAllAdmins().catch(() => []),
          adminAPI.getAllLogSheets().catch(() => []),
          adminAPI.getPendingProfiles().catch(() => []),
          adminAPI.getPendingMusic().catch(() => []),
          adminAPI.getAllProfiles().catch(() => []),
        ]);

        const computed: DashboardStats = {
          totalUsers: users.length,
          totalArtists: users.filter((u: any) => u.role === 'ARTIST').length,
          totalCompanies: users.filter((u: any) => u.role === 'COMPANY').length,
          totalMusic: music.length,
          approvedMusic: music.filter((m: any) => (m.status?.statusName || m.status?.status) === 'APPROVED').length,
          pendingMusic: pendingMusic.length,
          rejectedMusic: music.filter((m: any) => (m.status?.statusName || m.status?.status) === 'REJECTED').length,
          totalLogSheets: logSheets.length,
          pendingProfiles: pendingProfiles.length,
          approvedProfiles: allProfiles.filter((p: any) => (p.status?.statusName || p.status?.status) === 'APPROVED').length,
          rejectedProfiles: allProfiles.filter((p: any) => (p.status?.statusName || p.status?.status) === 'REJECTED').length,
          recentActivity: [],
        } as any;

        setStats(computed);

        // Process logsheet timeline
        const timelineMap: Record<string, number> = {};
        logSheets.forEach((sheet: any) => {
          const date = new Date(sheet.createdDate).toLocaleDateString();
          timelineMap[date] = (timelineMap[date] || 0) + 1;
        });
        
        const timeline = Object.entries(timelineMap)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-30); // Last 30 days
        
        setLogSheetTimeline(timeline);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">System-wide analytics and pending approvals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Users" value={stats?.totalUsers || 0} description="All users" icon={Users} />
          <StatsCard title="Artists" value={stats?.totalArtists || 0} description="Registered artists" icon={Users} />
          <StatsCard title="Companies" value={stats?.totalCompanies || 0} description="Registered companies" icon={FileText} />
          <StatsCard title="Music" value={stats?.totalMusic || 0} description="Total tracks" icon={Music} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Approvals Summary
            </CardTitle>
            <CardDescription>Pending items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Pending Profiles</p>
                <p className="text-2xl font-bold">{(stats as any)?.pendingProfiles || 0}</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Pending Music</p>
                <p className="text-2xl font-bold">{(stats as any)?.pendingMusic || 0}</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Approved Profiles</p>
                <p className="text-2xl font-bold">{(stats as any)?.approvedProfiles || 0}</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Rejected Profiles</p>
                <p className="text-2xl font-bold">{(stats as any)?.rejectedProfiles || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Breakdown of user types in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Artists', value: stats?.totalArtists || 0 },
                        { name: 'Companies', value: stats?.totalCompanies || 0 },
                        { name: 'Admins', value: stats?.totalUsers - (stats?.totalArtists || 0) - (stats?.totalCompanies || 0) || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {['#0088FE', '#00C49F', '#FFBB28'].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Music Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Music Status Distribution</CardTitle>
              <CardDescription>Overview of music approval status</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={[
                      { status: 'Pending', count: stats?.pendingMusic || 0 },
                      { status: 'Approved', count: stats?.approvedMusic || 0 },
                      { status: 'Rejected', count: stats?.rejectedMusic || 0 }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d">
                      {['#FFBB28', '#00C49F', '#FF8042'].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* LogSheet Activity Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>LogSheet Activity</CardTitle>
              <CardDescription>Daily logsheet submissions over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={logSheetTimeline} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
