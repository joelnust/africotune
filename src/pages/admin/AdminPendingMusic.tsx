import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { adminAPI } from '@/services/api';
import { ArtistWork } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  XCircle,
  Play,
  Download,
  Eye,
  Clock,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import VideoPlayerDialog from '@/components/common/VideoPlayerDialog';

const AdminPendingMusic: React.FC = () => {
  const [music, setMusic] = useState<ArtistWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<ArtistWork | null>(null);
  const [isrcCode, setIsrcCode] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const { toast } = useToast();
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoTrack, setVideoTrack] = useState<{ id: number; title: string; artist?: string; fileUrl: string; fileType?: string } | null>(null);

  useEffect(() => {
    loadMusic();
  }, []);

  // Listen for updates broadcast (e.g. from other admin windows) to refresh list
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key !== 'namsa:update') return;
      try {
        const payload = JSON.parse(e.newValue || '{}');
        if (payload?.type === 'music') {
          loadMusic();
          toast({ title: 'Music Status Changed', description: 'A music status was updated.' });
        }
      } catch (err) {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const loadMusic = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPendingMusic();
      setMusic(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load pending music",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewMusic = (musicItem: ArtistWork) => {
    setSelectedMusic(musicItem);
    setViewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedMusic || !isrcCode.trim()) {
      toast({
        title: "ISRC Code Required",
        description: "Please enter an ISRC code for approval",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(selectedMusic.id);
      await adminAPI.approveMusic(selectedMusic.id, isrcCode);
      toast({
        title: "Music Approved",
        description: `"${selectedMusic.title}" has been approved`,
      });
      setIsrcCode('');
      // Broadcast update so clients can refresh
      try { localStorage.setItem('namsa:update', JSON.stringify({ type: 'music', userId: selectedMusic.user?.id || null, musicId: selectedMusic.id, status: 'APPROVED', timestamp: Date.now() })); } catch (e) {}
      setSelectedMusic(null);
      setApproveDialogOpen(false);
      loadMusic();
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error?.response?.data?.message || "Failed to approve music",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedMusic || !rejectionNotes.trim()) {
      toast({
        title: "Rejection Notes Required",
        description: "Please enter notes for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(selectedMusic.id);
      await adminAPI.rejectMusic(selectedMusic.id, rejectionNotes);
      toast({
        title: "Music Rejected",
        description: `"${selectedMusic.title}" has been rejected`,
      });
      setRejectionNotes('');
      // Broadcast update so clients can refresh
      try { localStorage.setItem('namsa:update', JSON.stringify({ type: 'music', userId: selectedMusic.user?.id || null, musicId: selectedMusic.id, status: 'REJECTED', timestamp: Date.now() })); } catch (e) {}
      setSelectedMusic(null);
      setRejectDialogOpen(false);
      loadMusic();
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error?.response?.data?.message || "Failed to reject music",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const formatDuration = (duration: string) => {
    if (!duration) return 'Unknown';
    const seconds = parseInt(duration);
    if (isNaN(seconds)) return duration;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-namsa-success text-white"><CheckCircle className="w-3 h-3 mr-1" />APPROVED</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />REJECTED</Badge>;
      default:
        return <Badge variant="secondary">PENDING</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Pending Music">
        <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pending Music">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Music Approvals</h1>
          <p className="text-muted-foreground">Review and approve/reject music uploads</p>
        </div>

        {music.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No pending music to review</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Pending Music ({music.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border rounded-lg">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-3 text-left">Title</th>
                      <th className="border border-border p-3 text-left">Artist</th>
                      <th className="border border-border p-3 text-left">Album</th>
                      <th className="border border-border p-3 text-left">Type</th>
                      <th className="border border-border p-3 text-left">Duration</th>
                      <th className="border border-border p-3 text-left">Upload Date</th>
                      <th className="border border-border p-3 text-left">Status</th>
                      <th className="border border-border p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {music.map((musicItem) => (
                      <tr key={musicItem.id} className="hover:bg-muted/50">
                        <td className="border border-border p-3 font-medium">{musicItem.title}</td>
                        <td className="border border-border p-3">{musicItem.artist || musicItem.user?.email}</td>
                        <td className="border border-border p-3">{musicItem.albumName || '-'}</td>
                        <td className="border border-border p-3">{(musicItem.fileType || '').toLowerCase().startsWith('video') || /(.mp4|.mov|.avi|.mkv|.webm)$/i.test(musicItem.fileUrl || '') ? 'Video' : 'Audio'}</td>
                        <td className="border border-border p-3">{formatDuration(musicItem.duration)}</td>
                        <td className="border border-border p-3">
                          {new Date(musicItem.uploadedDate).toLocaleDateString()}
                        </td>
                        <td className="border border-border p-3">
                          {getStatusBadge((musicItem.status?.statusName || (musicItem as any).status?.status || 'PENDING'))}
                        </td>
                        <td className="border border-border p-3">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewMusic(musicItem)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedMusic(musicItem);
                                setApproveDialogOpen(true);
                              }}
                              disabled={processing === musicItem.id}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedMusic(musicItem);
                                setRejectDialogOpen(true);
                              }}
                              disabled={processing === musicItem.id}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* View Music Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Music Review</DialogTitle>
            </DialogHeader>
            
            {selectedMusic && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Track Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input value={selectedMusic.title} disabled />
                    </div>
                    <div>
                      <Label>Artist</Label>
                      <Input value={selectedMusic.artist || '-'} disabled />
                    </div>
                    <div>
                      <Label>Album</Label>
                      <Input value={selectedMusic.albumName || '-'} disabled />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input value={formatDuration(selectedMusic.duration)} disabled />
                    </div>
                    <div>
                      <Label>Genre</Label>
                      <Input value={selectedMusic.artistWorkType?.workTypeName || '-'} disabled />
                    </div>
                    <div>
                      <Label>Upload Type</Label>
                      <Input value={selectedMusic.artistUploadType?.typeName || '-'} disabled />
                    </div>
                    <div>
                      <Label>Work ID</Label>
                      <Input value={selectedMusic.workId || '-'} disabled />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input value={selectedMusic.country || '-'} disabled />
                    </div>
                    <div>
                      <Label>Upload Date</Label>
                      <Input value={new Date(selectedMusic.uploadedDate).toLocaleDateString()} disabled />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Artist Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Artist Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Uploaded By</Label>
                      <Input value={selectedMusic.user?.email || '-'} disabled />
                    </div>
                    <div>
                      <Label>Artist ID</Label>
                      <Input value={(selectedMusic as any).artistId || (selectedMusic as any).ArtistId || '-'} disabled />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Creative Credits */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Creative Credits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Composer</Label>
                      <Input value={selectedMusic.composer || '-'} disabled />
                    </div>
                    <div>
                      <Label>Author</Label>
                      <Input value={selectedMusic.author || '-'} disabled />
                    </div>
                    <div>
                      <Label>Arranger</Label>
                      <Input value={selectedMusic.arranger || '-'} disabled />
                    </div>
                    <div>
                      <Label>Producer</Label>
                      <Input value={selectedMusic.producer || '-'} disabled />
                    </div>
                    <div>
                      <Label>Publisher</Label>
                      <Input value={selectedMusic.publisher || '-'} disabled />
                    </div>
                    <div>
                      <Label>Label</Label>
                      <Input value={selectedMusic.labelName || '-'} disabled />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* File Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">File Actions</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (!selectedMusic.fileUrl) return;
                        const isVid = (selectedMusic.fileType || '').toLowerCase().startsWith('video') || /(.mp4|.mov|.avi|.mkv|.webm)$/i.test(selectedMusic.fileUrl || '');
                        if (isVid) {
                          setVideoTrack({ id: selectedMusic.id, title: selectedMusic.title, artist: selectedMusic.artist, fileUrl: selectedMusic.fileUrl, fileType: selectedMusic.fileType });
                          setVideoOpen(true);
                        } else {
                          const audio = new Audio(selectedMusic.fileUrl);
                          audio.play().catch(console.error);
                        }
                      }}
                      className="gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Play Track
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (selectedMusic.fileUrl) {
                          const link = document.createElement('a');
                          link.href = selectedMusic.fileUrl;
                          link.download = selectedMusic.title;
                          link.click();
                        }
                      }}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>

                {selectedMusic.notes && (
                  <>
                    <Separator />
                    <div>
                      <Label>Admin Notes</Label>
                      <Textarea value={selectedMusic.notes} disabled rows={3} />
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approve Music Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Approve Music</DialogTitle>
            </DialogHeader>
            
            {selectedMusic && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{selectedMusic.title}</p>
                  <p className="text-sm text-muted-foreground">by {selectedMusic.artist}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="isrcCode">ISRC Code *</Label>
                  <Input
                    id="isrcCode"
                    value={isrcCode}
                    onChange={(e) => setIsrcCode(e.target.value)}
                    placeholder="Enter ISRC code"
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setApproveDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleApprove} 
                    disabled={processing === selectedMusic.id || !isrcCode.trim()}
                    className="flex-1 bg-namsa-success hover:bg-namsa-success/90"
                  >
                    {processing === selectedMusic.id ? 'Processing...' : 'Approve Music'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Music Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Music</DialogTitle>
            </DialogHeader>
            
            {selectedMusic && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{selectedMusic.title}</p>
                  <p className="text-sm text-muted-foreground">by {selectedMusic.artist}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rejectionNotes">Rejection Notes *</Label>
                  <Textarea
                    id="rejectionNotes"
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setRejectDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleReject} 
                    disabled={processing === selectedMusic.id || !rejectionNotes.trim()}
                    className="flex-1"
                  >
                    {processing === selectedMusic.id ? 'Processing...' : 'Reject Music'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <VideoPlayerDialog open={videoOpen} onOpenChange={setVideoOpen} track={videoTrack as any} />
    </DashboardLayout>
  );
};

export default AdminPendingMusic;
