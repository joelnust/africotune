import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/common/StatsCard';
import DataTable, { Column, Action } from '@/components/common/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Music,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Download,
  Play,
  Eye,
  Edit,
  BarChart3,
  User,
  FileText,
} from 'lucide-react';
import namsaLogo from '@/assets/namsa-logo.png';
import { artistAPI, companyAPI } from '@/services/api';
import { ArtistWork, ArtistStats, MemberDetails } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ArtistDashboard: React.FC = () => {
  const [stats, setStats] = useState<ArtistStats | null>(null);
  const [recentMusic, setRecentMusic] = useState<ArtistWork[]>([]);
  const [profile, setProfile] = useState<MemberDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [musicData, profileData, allSheets] = await Promise.all([
          artistAPI.getMyMusic().catch(() => []),
          artistAPI.getProfile().catch(() => null),
          companyAPI.getLogSheets().catch(() => []),
        ]);

        // Compute stats from lists
        const approved = musicData.filter((m: any) => ((m.status?.statusName || m.status?.status) === 'APPROVED')).length;
        const pending = musicData.filter((m: any) => ((m.status?.statusName || m.status?.status) === 'PENDING')).length;
        const rejected = musicData.filter((m: any) => ((m.status?.statusName || m.status?.status) === 'REJECTED')).length;
        const myTrackIds = new Set(musicData.map((m: any) => m.id));
        let totalPlays = 0;
        for (const sheet of allSheets as any[]) {
          for (const m of (sheet?.selectedMusic || [])) {
            if (myTrackIds.has((m as any).id)) totalPlays += 1;
          }
        }
        const totalDownloads = 0;

        const computed: ArtistStats = {
          totalUploads: musicData.length,
          approvedMusic: approved,
          pendingMusic: pending,
          rejectedMusic: rejected,
          totalPlays,
          totalDownloads,
          recentActivity: [],
        } as any;

        setStats(computed);
        setRecentMusic(musicData.slice(0, 5));
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

    // Listen for status updates
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key !== 'namsa:update') return;
      try {
        const payload = JSON.parse(e.newValue || '{}');
        if (payload?.type === 'profile' || payload?.type === 'music') {
          loadDashboardData();
          toast({ title: 'Update Received', description: 'Some of your data has changed.' });
        }
      } catch (err) {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [toast]);

  const musicColumns: Column<ArtistWork>[] = [
    {
      key: 'title',
      header: 'Title',
      accessor: 'title',
      sortable: true,
    },
    {
      key: 'artist',
      header: 'Artist',
      accessor: 'artist',
      sortable: true,
    },
    {
      key: 'albumName',
      header: 'Album',
      accessor: 'albumName',
      sortable: true,
    },
    {
      key: 'duration',
      header: 'Duration',
      accessor: 'duration',
    },
    {
      key: 'uploadedDate',
      header: 'Uploaded',
      accessor: 'uploadedDate',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const statusName = (value?.statusName || value?.status || 'PENDING');
        return (
          <Badge 
            variant={statusName === 'APPROVED' ? 'default' : statusName === 'REJECTED' ? 'destructive' : 'secondary'}
            className="hover-scale"
          >
            {statusName === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
            {statusName === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
            {statusName === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
            {statusName}
          </Badge>
        );
      },
    },
  ];

  const musicActions: Action<ArtistWork>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (item) => navigate(`/artist/music/${item.id}`),
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (item) => navigate(`/artist/music/${item.id}/edit`),
      show: (item) => ((item.status?.statusName || item.status?.status) !== 'APPROVED'),
    },
    {
      label: 'Play',
      icon: Play,
      onClick: (item) => {
        if (item.fileUrl) {
          const audio = new Audio(item.fileUrl);
          audio.play().catch(console.error);
        }
      },
    },
    {
      label: 'Download',
      icon: Download,
      onClick: async (item) => {
        if (item.fileUrl && item.title) {
          try {
            const link = document.createElement('a');
            link.href = item.fileUrl;
            link.download = `${item.title}.${item.fileType || 'mp3'}`;
            link.click();
          } catch (error) {
            toast({
              title: "Download Failed",
              description: "Failed to download the file.",
              variant: "destructive",
            });
          }
        }
      },
    },
  ];

  const getProfileCompletionStatus = () => {
    const isApproved = (profile?.status?.statusName || (profile as any)?.status?.status) === 'APPROVED';
    const hasArtistId = Boolean((profile as any)?.ArtistId || (profile as any)?.artistId);
    const hasIpi = Boolean((profile as any)?.IPI_number || (profile as any)?.ipiNumber || (profile as any)?.ipi_number);
    // Consider profile "complete" when approved and identifiers exist
    return { complete: Boolean(isApproved && hasArtistId && hasIpi), isApproved };
  };

  const getApprovalProgress = () => {
    if (!profile) return { step: 1, total: 3, status: 'pending' };
    
    const hasProfile = (profile.status?.statusName || (profile as any).status?.status) === 'APPROVED';
    const hasDocuments = true; // Assume documents are uploaded if profile exists
    const canUploadMusic = hasProfile;
    
    if (hasProfile) return { step: 3, total: 3, status: 'approved' };
    if (hasDocuments) return { step: 2, total: 3, status: 'pending' };
    return { step: 1, total: 3, status: 'pending' };
  };

  if (loading) {
    return (
      <DashboardLayout title="Artist Dashboard">
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

  const approvalProgress = getApprovalProgress();
  const profileStatus = getProfileCompletionStatus();

  return (
    <DashboardLayout title="Artist Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-namsa p-6 text-primary-foreground">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {profile?.firstName || 'Artist'}!
            </h2>
            <p className="text-primary-foreground/80">
              Manage your music, track your performance, and grow your audience with NAMSA.
            </p>
            <div className="mt-4 flex gap-4">
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                <span className="text-muted-foreground">Artist ID:</span>
                <span className="font-semibold ml-2 text-black dark:text-white">{(profile as any)?.ArtistId || (profile as any)?.artistId || '-'}</span>
              </div>
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                <span className="text-muted-foreground">IPI:</span>
                <span className="font-semibold ml-2 text-foreground">{(profile as any)?.IPI_number || (profile as any)?.ipi_number || (profile as any)?.ipiNumber || '-'}</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary-foreground/10"></div>
        </div>

        {/* Profile Status Alert */}
        {profile && ((profile.status?.statusName || (profile as any).status?.status) !== 'APPROVED') && (
          <Card className="border-namsa-warning bg-namsa-warning/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-namsa-warning">
                <Clock className="w-5 h-5 mr-2" />
                Profile Approval Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Complete your profile setup to start uploading music. Your profile is currently being reviewed.
              </p>
              <div className="text-sm text-muted-foreground">
                Some documents or profile details are missing. Please complete your profile and upload all documents to enable uploads.
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/artist/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Complete Profile
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/artist/documents')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approval Info */}
        {profile?.status?.statusName === 'APPROVED' && (
          <Card>
            <CardHeader>
              <CardTitle>Your Membership Details</CardTitle>
              <CardDescription>Shown after approval</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">IPI Number</span>
                <div className="text-lg font-semibold text-foreground">{(profile as any).IPI_number || (profile as any).ipi_number || (profile as any).ipiNumber || '-'}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Artist ID</span>
                <div className="text-lg font-semibold text-black dark:text-white">{(profile as any).ArtistId || (profile as any).artistId || '-'}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Uploads"
            value={stats?.totalUploads || 0}
            description="Music tracks uploaded"
            icon={Music}
          />
          
          <StatsCard
            title="Approved Tracks"
            value={stats?.approvedMusic || 0}
            description="Ready for licensing"
            icon={CheckCircle}
            variant="success"
          />
          
          <StatsCard
            title="Total Plays"
            value={stats?.totalPlays || 0}
            description="Times your music was played"
            icon={Play}
          />
          
          <StatsCard
            title="Total Downloads"
            value={stats?.totalDownloads || 0}
            description="Music downloads"
            icon={TrendingUp}
            variant="gradient"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover-scale cursor-pointer" onClick={() => navigate('/artist/upload')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-32 h-32 bg-gradient-namsa rounded-full flex items-center justify-center mb-4">
                <img src={namsaLogo} alt="NAMSA" className="w-28 h-28 object-contain" />
              </div>
              <CardTitle>Upload New Music</CardTitle>
              <CardDescription>
                Share your latest tracks with the world
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-scale cursor-pointer" onClick={() => navigate('/artist/music')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-32 h-32 bg-gradient-accent rounded-full flex items-center justify-center mb-4">
                <img src={namsaLogo} alt="NAMSA" className="w-28 h-28 object-contain" />
              </div>
              <CardTitle>Manage Music</CardTitle>
              <CardDescription>
                View and edit your music library
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-scale cursor-pointer" onClick={() => navigate('/artist/stats')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-32 h-32 bg-namsa-success rounded-full flex items-center justify-center mb-4">
                <img src={namsaLogo} alt="NAMSA" className="w-28 h-28 object-contain" />
              </div>
              <CardTitle>View Analytics</CardTitle>
              <CardDescription>
                Track your performance metrics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Music */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Music Uploads</CardTitle>
                <CardDescription>
                  Your latest uploaded tracks and their status
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/artist/music')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={recentMusic}
              columns={musicColumns}
              actions={musicActions}
              searchable={false}
              pagination={false}
              emptyMessage="No music uploaded yet. Upload your first track to get started!"
            />
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Music Status Overview</CardTitle>
              <CardDescription>Distribution of your music by approval status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-namsa-success rounded-full"></div>
                    <span className="text-sm">Approved</span>
                  </div>
                  <span className="text-sm font-medium">{stats?.approvedMusic || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-namsa-warning rounded-full"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="text-sm font-medium">{stats?.pendingMusic || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-namsa-error rounded-full"></div>
                    <span className="text-sm">Rejected</span>
                  </div>
                  <span className="text-sm font-medium">{stats?.rejectedMusic || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
              <CardDescription>Approval and documents status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">Approval: <span className={profileStatus.isApproved ? 'text-namsa-success font-medium' : 'text-namsa-warning font-medium'}>{profileStatus.isApproved ? 'Approved' : 'Pending'}</span></div>
              <div className="text-sm">Completion: <span className={profileStatus.complete ? 'text-namsa-success font-medium' : 'text-namsa-warning font-medium'}>{profileStatus.complete ? 'Complete' : 'Incomplete'}</span></div>
              {!profileStatus.complete && (
                <Button variant="outline" size="sm" onClick={() => navigate('/artist/profile')} className="w-full">Update Profile</Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ArtistDashboard;
