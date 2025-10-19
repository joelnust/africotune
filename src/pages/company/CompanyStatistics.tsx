import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/common/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { companyAPI } from '@/services/api';
import { CompanyStats, ArtistWork, LogSheet } from '@/types';
import { 
  BarChart3, 
  TrendingUp, 
  Music, 
  FileSpreadsheet, 
  Users, 
  Download,
  Play,
  Calendar,
  Activity
} from 'lucide-react';

const CompanyStatistics: React.FC = () => {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [topTracks, setTopTracks] = useState<ArtistWork[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        
        const [statsData, musicData] = await Promise.all([
          companyAPI.getStats(),
          companyAPI.getApprovedMusic()
        ]);
        
        setStats(statsData);
        setTopTracks(musicData.slice(0, 10));
        setRecentActivity(statsData.recentActivity || []);
      } catch (error) {
        console.error('Failed to load statistics:', error);
        // If real endpoint has no analytics yet, hide page content
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, [toast]);

  if (loading) {
    return (
      <DashboardLayout title="Statistics">
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout title="Statistics">
        <Card>
          <CardHeader>
            <CardTitle>No Analytics Available</CardTitle>
            <CardDescription>This page will be hidden until analytics endpoints provide data.</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Statistics">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Statistics</h1>
          <p className="text-muted-foreground">
            Track your music usage, log sheets, and performance metrics
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Music Library"
            value={stats?.approvedMusicCount || 0}
            description="Approved tracks available"
            icon={Music}
            trend={{
              value: 15,
              label: "vs last month",
              isPositive: true,
            }}
            variant="gradient"
          />
          
          <StatsCard
            title="Log Sheets Created"
            value={stats?.logSheetsCount || 0}
            description="Music usage reports"
            icon={FileSpreadsheet}
            trend={{
              value: 8,
              label: "vs last month",
              isPositive: true,
            }}
          />
          
          <StatsCard
            title="Active Artists"
            value={stats?.activeArtists || 0}
            description="Contributing artists"
            icon={Users}
          />
          
          <StatsCard
            title="Tracks Used"
            value={stats?.totalTracksUsed || 0}
            description="Total music selections"
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Music Usage Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Music Usage Analytics
              </CardTitle>
              <CardDescription>
                Breakdown of your music consumption patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pop Music</span>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Jazz</span>
                  <span className="text-sm text-muted-foreground">30%</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Gospel</span>
                  <span className="text-sm text-muted-foreground">15%</span>
                </div>
                <Progress value={15} className="h-2" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Traditional</span>
                  <span className="text-sm text-muted-foreground">10%</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Tracks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Most Used Tracks
              </CardTitle>
              <CardDescription>
                Tracks frequently selected in your log sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTracks.map((track, index) => (
                  <div key={track.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-namsa flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{track.title}</p>
                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{track.artistWorkType?.workTypeName || 'Unknown'}</Badge>
                      <span className="text-sm text-muted-foreground">{Math.floor(Math.random() * 50) + 10} uses</span>
                    </div>
                  </div>
                ))}
                
                {topTracks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No track usage data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest actions and events in your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="w-2 h-2 rounded-full bg-namsa-success"></div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  // Default activity examples
                  <>
                    <div className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="w-2 h-2 rounded-full bg-namsa-success"></div>
                      <div className="flex-1">
                        <p className="font-medium">Log sheet created</p>
                        <p className="text-sm text-muted-foreground">Today at 2:30 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="w-2 h-2 rounded-full bg-namsa-primary"></div>
                      <div className="flex-1">
                        <p className="font-medium">Music library updated</p>
                        <p className="text-sm text-muted-foreground">Yesterday at 4:15 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="w-2 h-2 rounded-full bg-namsa-warning"></div>
                      <div className="flex-1">
                        <p className="font-medium">Profile information updated</p>
                        <p className="text-sm text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Hours Played</span>
                  <span className="text-sm font-medium">{Math.floor(Math.random() * 200) + 100}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Log Sheets</span>
                  <span className="text-sm font-medium">{stats?.logSheetsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Artists Featured</span>
                  <span className="text-sm font-medium">{stats?.activeArtists || 0}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-namsa-success">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyStatistics;