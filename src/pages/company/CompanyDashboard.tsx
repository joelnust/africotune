import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/common/StatsCard';
import DataTable, { Column, Action } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { companyAPI } from '@/services/api';
import { CompanyStats, ArtistWork, LogSheet, Company } from '@/types';
import {
  Music,
  Users,
  FileSpreadsheet,
  Play,
  Download,
  Plus,
  Settings,
  TrendingUp,
  User,
  FileText,
  Video
} from 'lucide-react';

const CompanyDashboard: React.FC = () => {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [approvedMusic, setApprovedMusic] = useState<ArtistWork[]>([]);
  const [approvedVideos, setApprovedVideos] = useState<ArtistWork[]>([]);
  const [logSheets, setLogSheets] = useState<LogSheet[]>([]);
  const [profile, setProfile] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [mediaTab, setMediaTab] = useState<'audio' | 'video'>('audio');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [musicData, logSheetsData, profileData] = await Promise.all([
          companyAPI.getApprovedMusic().catch(() => []),
          companyAPI.getLogSheets().catch(() => []),
          companyAPI.getProfile().catch(() => null)
        ]);

        // Separate music and videos
        const audioTracks = musicData.filter((m: any) => !m.fileType?.toLowerCase().includes('video'));
        const videoTracks = musicData.filter((m: any) => m.fileType?.toLowerCase().includes('video'));

        const computed: CompanyStats = {
          approvedMusicCount: musicData.length,
          logSheetsCount: logSheetsData.length,
          activeArtists: new Set(musicData.map((m: any) => m.artist || m.user?.email)).size,
          totalTracksUsed: 0,
          totalMusicSelected: 0,
          totalSpent: 0,
          recentActivity: [],
          totalLogSheets: logSheetsData.length,
          totalMusicUsed: 0,
          activeArtistsCount: 0,
          approvedMusicLibrary: 0,
        } as any;

        setStats(computed);
        setApprovedMusic(audioTracks);
        setApprovedVideos(videoTracks);
        setLogSheets(logSheetsData);
        setProfile(profileData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [toast]);

  const musicColumns: Column<ArtistWork>[] = [
    {
      key: 'title',
      header: 'Title',
      accessor: 'title',
      className: 'font-medium',
    },
    {
      key: 'artist',
      header: 'Artist',
      accessor: 'artist',
    },
    {
      key: 'artistWorkType',
      header: 'Genre',
      accessor: (item) => item.artistWorkType?.workTypeName || '-',
    },
    {
      key: 'duration',
      header: 'Duration',
      accessor: 'duration',
      render: (value) => value || 'N/A',
    },
    {
      key: 'isrcCode',
      header: 'ISRC',
      accessor: 'isrcCode',
      render: (value) => value || 'Pending',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <Badge variant="default" className="bg-namsa-success text-white">
          {value?.statusName || 'Approved'}
        </Badge>
      ),
    },
  ];

  const musicActions: Action<ArtistWork>[] = [
    {
      label: 'Play',
      icon: Play,
      onClick: (music) => {
        if (music.fileUrl) navigate('/company/player');
      },
    },
    {
      label: 'Download',
      icon: Download,
      onClick: (music) => {
        if (music.fileUrl) {
          const link = document.createElement('a');
          link.href = music.fileUrl;
          link.download = `${music.title}.${music.fileType || 'mp3'}`;
          link.click();
        }
      },
    },
  ];

  const logSheetColumns: Column<LogSheet>[] = [
    {
      key: 'title',
      header: 'Name',
      accessor: (item) => (item as any).logSheetName || (item as any).title || '-',
      className: 'font-medium',
    },
    {
      key: 'selectedMusic',
      header: 'Music Count',
      accessor: (item) => item.selectedMusic?.length || 0,
    },
    {
      key: 'createdDate',
      header: 'Created',
      accessor: 'createdDate',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
    },
  ];

  const logSheetActions: Action<LogSheet>[] = [
    {
      label: 'View',
      icon: FileSpreadsheet,
      onClick: (logSheet) => navigate(`/company/logsheets/${logSheet.id}`),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Company Dashboard">
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

  return (
    <DashboardLayout title="Company Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-namsa p-6 text-primary-foreground">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {profile?.companyName || 'Company'}! 🎵
            </h2>
            <p className="text-primary-foreground/80">
              Manage your music library, create log sheets, and track music usage with NAMSA.
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary-foreground/10"></div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button onClick={() => navigate('/company/logsheet/create')} className="gap-2 bg-gradient-namsa hover:opacity-90">
            <Plus className="h-4 w-4" />
            Create Log Sheet
          </Button>
          <Button variant="outline" onClick={() => navigate('/company/settings')} className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Approved Music"
            value={stats?.approvedMusicCount || 0}
            description="Available tracks"
            icon={Music}
            trend={{
              value: stats?.approvedMusicCount || 0,
              label: "vs last month",
              isPositive: true,
            }}
            className="hover-scale cursor-pointer"
          />
          
          <StatsCard
            title="Log Sheets Created"
            value={stats?.logSheetsCount || 0}
            description="Total log sheets"
            icon={FileText}
            trend={{
              value: stats?.logSheetsCount || 0,
              label: "vs last month",
              isPositive: true,
            }}
            className="hover-scale cursor-pointer"
          />
          
          <StatsCard
            title="Active Artists"
            value={stats?.activeArtists || 0}
            description="Artists in library"
            icon={User}
          />
          
          <StatsCard
            title="Tracks Used"
            value={stats?.totalTracksUsed || 0}
            description="Music selections"
            icon={TrendingUp}
            variant="gradient"
          />
        </div>

        {/* Media Library with Tabs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Media Library</CardTitle>
                <CardDescription>
                  Browse and manage approved music tracks and videos
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/company/music')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={mediaTab} onValueChange={(value) => setMediaTab(value as 'audio' | 'video')}>
              <TabsList className="mb-6">
                <TabsTrigger value="audio" className="gap-2">
                  <Music className="h-4 w-4" />
                  Audio Tracks ({approvedMusic.length})
                </TabsTrigger>
                <TabsTrigger value="video" className="gap-2">
                  <Video className="h-4 w-4" />
                  Videos ({approvedVideos.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="audio" className="space-y-4">
                {approvedMusic.length > 0 ? (
                  <DataTable
                    data={approvedMusic.slice(0, 10)}
                    columns={musicColumns}
                    actions={musicActions}
                    searchable={true}
                    emptyMessage="No approved audio tracks available"
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto opacity-20 mb-2" />
                    <p>No approved audio tracks available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="video" className="space-y-4">
                {approvedVideos.length > 0 ? (
                  <DataTable
                    data={approvedVideos.slice(0, 10)}
                    columns={musicColumns}
                    actions={musicActions}
                    searchable={true}
                    emptyMessage="No approved videos available"
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto opacity-20 mb-2" />
                    <p>No approved videos available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Log Sheets */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Log Sheets</CardTitle>
                <CardDescription>
                  Your recently created log sheets
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/company/logsheets')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={logSheets.slice(0, 5)}
              columns={logSheetColumns}
              actions={logSheetActions}
              emptyMessage="No log sheets created yet"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
