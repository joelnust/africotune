import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column, Action } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { adminAPI } from '@/services/api';
import MusicPlayerDialog from '@/components/common/MusicPlayerDialog';
import VideoPlayerDialog from '@/components/common/VideoPlayerDialog';
import { ArtistWork } from '@/types';
import { Play, Download, CheckCircle, Clock, XCircle } from 'lucide-react';

const AdminAllMusic: React.FC = () => {
  const [music, setMusic] = useState<ArtistWork[]>([]);

  useEffect(() => {
    const loadMusic = async () => {
      try {
        setLoading(true);
        const data = await adminAPI.getAllMusic();
        setMusic(data);
      } catch (error) {
        console.error('Load music error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load music',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    loadMusic();
  }, []);
  
  // Listen for status updates pushed to localStorage (same pattern as ArtistMyMusic)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key !== 'namsa:update') return;
      try {
        const payload = JSON.parse(e.newValue || '{}');
        if (payload?.type === 'music') {
          adminAPI.getAllMusic().then((data) => setMusic(data)).catch(() => {});
          toast({ title: 'Music Status Updated', description: 'A music status was updated.' });
        }
      } catch (err) {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerTrack, setPlayerTrack] = useState<{ id: number; title: string; artist?: string; fileUrl: string; fileType?: string } | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoTrack, setVideoTrack] = useState<{ id: number; title: string; artist?: string; fileUrl: string; fileType?: string } | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const isVideo = (m: ArtistWork) => {
    const ft = (m.fileType || '').toLowerCase();
    const url = (m.fileUrl || '').toLowerCase();
    return ft.startsWith('video') || /(.mp4|.mov|.avi|.mkv|.webm)$/.test(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-namsa-success text-white"><CheckCircle className="w-3 h-3 mr-1" />APPROVED</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />REJECTED</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />PENDING</Badge>;
    }
  };
  const playAtIndex = (idx: number) => {
    const m = music[idx];
    if (!m) return;
    setCurrentIndex(idx);
    if (isVideo(m)) {
      setVideoTrack({ id: m.id, title: m.title, artist: m.artist, fileUrl: m.fileUrl, fileType: m.fileType });
      setVideoOpen(true);
      setPlayerOpen(false);
    } else {
      setPlayerTrack({ id: m.id, title: m.title, artist: m.artist, fileUrl: m.fileUrl, fileType: m.fileType });
      setPlayerOpen(true);
      setVideoOpen(false);
    }
  };

  const columns: Column<ArtistWork>[] = [
    { key: 'title', header: 'Title', accessor: 'title', className: 'font-medium' },
    { key: 'artist', header: 'Artist', accessor: 'artist' },
    { key: 'artistWorkType', header: 'Genre', accessor: (item) => item.artistWorkType?.workTypeName || '-' },
    { key: 'albumName', header: 'Album', accessor: 'albumName' },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status?.status || 'PENDING',
      render: (value) => getStatusBadge(String(value))
    },
    { key: 'isrcCode', header: 'ISRC', accessor: (r) => r.isrcCode || 'Pending' },
    { key: 'mediaType', header: 'Type', accessor: (item) => isVideo(item) ? 'Video' : 'Audio', render: (value, item) => (
      <span className="flex items-center gap-1">{isVideo(item) ? <Play className="h-4 w-4 text-blue-500" /> : <Play className="h-4 w-4 text-green-500" />}{value}</span>
    ) },
    { key: 'actions', header: 'Actions', accessor: undefined, render: (_value, item) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => {
          const idx = music.findIndex(m => m.id === item.id);
          playAtIndex(Math.max(0, idx));
        }}>
          <Play className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => {
          if (item.fileUrl) {
            const link = document.createElement('a');
            link.href = item.fileUrl;
            link.download = `${item.title}.${item.fileType || 'mp3'}`;
            link.click();
          } else {
            toast({ title: 'Download Not Available', description: 'No audio file available for download', variant: 'destructive' });
          }
        }}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    ) },
  ];

  const actions: Action<ArtistWork>[] = [
    {
      label: 'Play',
      icon: Play,
      onClick: (musicItem) => {
        if (!musicItem.fileUrl) {
          toast({ title: 'Media Not Available', description: 'No media file available for this track', variant: 'destructive' });
          return;
        }
        const idx = music.findIndex(m => m.id === musicItem.id);
        playAtIndex(Math.max(0, idx));
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
        } else {
          toast({
            title: "Download Not Available",
            description: "No audio file available for download",
            variant: "destructive",
          });
        }
      },
    },
  ];

  return (
    <DashboardLayout title="All Music">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">All Music</h1>
        <DataTable
          data={music}
          columns={columns}
          actions={actions}
          loading={loading}
          searchable={true}
          emptyMessage="No music available"
        />
        <MusicPlayerDialog
          open={playerOpen}
          onOpenChange={setPlayerOpen}
          track={playerTrack}
          onPrev={() => currentIndex > 0 ? playAtIndex(currentIndex - 1) : undefined}
          onNext={() => currentIndex < music.length - 1 ? playAtIndex(currentIndex + 1) : undefined}
        />
        <VideoPlayerDialog
          open={videoOpen}
          onOpenChange={setVideoOpen}
          track={videoTrack as any}
          onPrev={() => currentIndex > 0 ? playAtIndex(currentIndex - 1) : undefined}
          onNext={() => currentIndex < music.length - 1 ? playAtIndex(currentIndex + 1) : undefined}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminAllMusic;
