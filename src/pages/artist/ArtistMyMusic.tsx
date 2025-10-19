import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column, Action } from '@/components/common/DataTable';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { artistAPI, lookupAPI } from '@/services/api';
import { ArtistWork, ArtistUploadType, ArtistWorkType } from '@/types';
import MusicPlayerDialog from '@/components/common/MusicPlayerDialog';
import VideoPlayerDialog from '@/components/common/VideoPlayerDialog';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Play, 
  Download, 
  Music, 
  CheckCircle, 
  Clock, 
  XCircle,
  Upload,
  Save,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const ArtistMyMusic: React.FC = () => {
  const [rows, setRows] = useState<ArtistWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMusic, setEditingMusic] = useState<ArtistWork | null>(null);
  const [viewingMusic, setViewingMusic] = useState<ArtistWork | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerTrack, setPlayerTrack] = useState<{ id: number; title: string; artist?: string; fileUrl: string; fileType?: string } | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoTrack, setVideoTrack] = useState<{ id: number; title: string; artist?: string; fileUrl: string; fileType?: string } | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const isVideo = (m: ArtistWork) => {
    const ft = (m.fileType || '').toLowerCase();
    const url = (m.fileUrl || '').toLowerCase();
    return ft.startsWith('video') || /(\.mp4|\.mov|\.avi|\.mkv|\.webm)$/.test(url);
  };
  const playAtIndex = (idx: number) => {
    const m = rows[idx];
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
  const [editForm, setEditForm] = useState<any>({});
  const [editCurrentPage, setEditCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [lookups, setLookups] = useState<{ uploadTypes: ArtistUploadType[]; workTypes: ArtistWorkType[] }>({
    uploadTypes: [],
    workTypes: [],
  });
  const { toast } = useToast();
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [musicData, uploadTypes, workTypes] = await Promise.all([
          artistAPI.getMyMusic().catch(() => []),
          lookupAPI.getArtistUploadTypes().catch(() => []),
          lookupAPI.getArtistWorkTypes().catch(() => []),
        ]);
        setRows(musicData);
        setLookups({ uploadTypes, workTypes });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Open view dialog if navigated to /artist/music/:id
  useEffect(() => {
    if (!params.id) return;
    const idNum = parseInt(params.id, 10);
    if (!Number.isFinite(idNum)) return;
    const item = rows.find(r => r.id === idNum);
    if (item) setViewingMusic(item);
  }, [params.id, rows]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key !== 'namsa:update') return;
      try {
        const payload = JSON.parse(e.newValue || '{}');
        if (payload?.type === 'music') {
          // If user-specific, only reload if current user is the owner
          // otherwise just reload the list to reflect status changes
          artistAPI.getMyMusic().then((data) => setRows(data)).catch(() => {});
          toast({ title: 'Music Status Updated', description: 'A music status was updated by an admin.' });
        }
      } catch (err) {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleView = (music: ArtistWork) => {
    setViewingMusic(music);
    // Ensure url reflects current view
    navigate(`/artist/music/${music.id}`, { replace: false });
  };

  const handleEdit = (music: ArtistWork) => {
    setEditingMusic(music);
    setEditForm({
      title: music.title,
      albumName: music.albumName,
      artist: music.artist,
      groupOrBandOrStageName: music.groupOrBandOrStageName,
      featuredArtist: music.featuredArtist,
      producer: music.producer,
      duration: music.duration,
      country: music.country,
      artistUploadTypeId: music.artistUploadType?.id,
      artistWorkTypeId: music.artistWorkType?.id,
      composer: music.composer,
      author: music.author,
      arranger: music.arranger,
      publisher: music.publisher,
      publishersName: music.publishersName,
      publisherAddress: music.publisherAddress,
      publisherTelephone: music.publisherTelephone,
      recordedBy: music.recordedBy,
      addressOfRecordingCompany: music.addressOfRecordingCompany,
      recordingCompanyTelephone: music.recordingCompanyTelephone,
      labelName: music.labelName,
      dateRecorded: music.dateRecorded,
    });
    setEditCurrentPage(1);
  };

  const handleSaveEdit = async () => {
    if (!editingMusic) return;
    if (!editFile) {
      toast({
        title: 'File Required',
        description: 'Please select a new audio/video file to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      await artistAPI.updateMusic(editingMusic.id, editingMusic, editForm, editFile);
      toast({
        title: 'Music Updated',
        description: 'Your music has been updated successfully',
      });
      setEditingMusic(null);
      setEditFile(null);
      setEditCurrentPage(1);
      // Reload data
      const data = await artistAPI.getMyMusic().catch(() => []);
      setRows(data);
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error?.response?.data?.message || 'Failed to update music',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (music: ArtistWork) => {
    if (!window.confirm(`Are you sure you want to delete "${music.title}"?`)) return;
    
    try {
      await artistAPI.deleteMusic(music.id);
      toast({
        title: "Music Deleted",
        description: "Your music has been deleted successfully",
      });
      setRows(prev => prev.filter(r => r.id !== music.id));
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error?.response?.data?.message || "Failed to delete music",
        variant: "destructive",
      });
    }
  };

  const handlePlay = (music: ArtistWork) => {
    if (!music.fileUrl) {
      toast({ title: 'File Not Available', description: 'No media file available for this track', variant: 'destructive' });
      return;
    }
    const idx = rows.findIndex(r => r.id === music.id);
    playAtIndex(Math.max(0, idx));
  };

  const handleDownload = (music: ArtistWork) => {
    if (music.fileUrl) {
      const link = document.createElement('a');
      link.href = music.fileUrl;
      link.download = `${music.title}.${music.fileType || 'mp3'}`;
      link.click();
    } else {
      toast({
        title: "Download Not Available",
        description: "No file available for download",
        variant: "destructive",
      });
    }
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

  const cols: Column<ArtistWork>[] = [
    { key: 'title', header: 'Title', accessor: 'title', className: 'font-medium' },
    { key: 'artist', header: 'Artist', accessor: 'artist' },
    { key: 'albumName', header: 'Album', accessor: 'albumName' },
    { key: 'mediaType', header: 'Type', accessor: (r) => isVideo(r) ? 'Video' : 'Audio' },
    { key: 'duration', header: 'Duration', accessor: 'duration' },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      render: (value) => getStatusBadge((value?.statusName || value?.status || 'PENDING'))
    },
    { key: 'isrcCode', header: 'ISRC', accessor: (r) => r.isrcCode || 'Pending' },
  ];

  const actions: Action<ArtistWork>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: handleView,
    },
    {
      label: 'Play',
      icon: Play,
      onClick: handlePlay,
    },
    {
      label: 'Download',
      icon: Download,
      onClick: handleDownload,
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: handleEdit,
      show: (item) => ((item.status?.statusName || (item as any).status?.status) !== 'APPROVED')
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: handleDelete,
      show: (item) => ((item.status?.statusName || (item as any).status?.status) !== 'APPROVED')
    }
  ];

  return (
    <DashboardLayout title="My Music">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Music</h1>
          <p className="text-muted-foreground">
            Manage your uploaded music tracks
          </p>
        </div>

        {loading ? (
          <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
        ) : (
          <DataTable data={rows} columns={cols} actions={actions} searchable emptyMessage="No music uploaded yet" />
        )}

        {/* View Music Details Dialog */}
        <Dialog open={!!viewingMusic} onOpenChange={(open) => {
          if (!open) {
            setViewingMusic(null);
            navigate('/artist/music', { replace: true });
          }
        }}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Music Details</DialogTitle>
            </DialogHeader>
            
            {viewingMusic && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Track Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input value={viewingMusic.title} disabled />
                    </div>
                    <div>
                      <Label>Artist</Label>
                      <Input value={viewingMusic.artist || '-'} disabled />
                    </div>
                    <div>
                      <Label>Album</Label>
                      <Input value={viewingMusic.albumName || '-'} disabled />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input value={viewingMusic.duration || '-'} disabled />
                    </div>
                    <div>
                      <Label>Genre</Label>
                      <Input value={viewingMusic.artistWorkType?.workTypeName || '-'} disabled />
                    </div>
                    <div>
                      <Label>Upload Type</Label>
                      <Input value={viewingMusic.artistUploadType?.typeName || '-'} disabled />
                    </div>
                    <div>
                      <Label>Work ID</Label>
                      <Input value={viewingMusic.workId || '-'} disabled />
                    </div>
                    <div>
                      <Label>ISRC Code</Label>
                      <Input value={viewingMusic.isrcCode || 'Pending'} disabled />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="pt-2">
                        {getStatusBadge((viewingMusic.status?.statusName || (viewingMusic as any).status?.status || 'PENDING'))}
                      </div>
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
                      <Input value={viewingMusic.composer || '-'} disabled />
                    </div>
                    <div>
                      <Label>Author</Label>
                      <Input value={viewingMusic.author || '-'} disabled />
                    </div>
                    <div>
                      <Label>Arranger</Label>
                      <Input value={viewingMusic.arranger || '-'} disabled />
                    </div>
                    <div>
                      <Label>Producer</Label>
                      <Input value={viewingMusic.producer || '-'} disabled />
                    </div>
                    <div>
                      <Label>Publisher</Label>
                      <Input value={viewingMusic.publisher || '-'} disabled />
                    </div>
                    <div>
                      <Label>Label</Label>
                      <Input value={viewingMusic.labelName || '-'} disabled />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* File Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">File Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>File Type</Label>
                      <Input value={viewingMusic.fileType || '-'} disabled />
                    </div>
                    <div>
                      <Label>Upload Date</Label>
                      <Input value={new Date(viewingMusic.uploadedDate).toLocaleDateString()} disabled />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handlePlay(viewingMusic)} className="gap-2">
                      <Play className="h-4 w-4" />
                      Play Track
                    </Button>
                    <Button variant="outline" onClick={() => handleDownload(viewingMusic)} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>

                {viewingMusic.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Admin Notes</h3>
                      <Textarea value={viewingMusic.notes} disabled rows={3} />
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <MusicPlayerDialog
          open={playerOpen}
          onOpenChange={setPlayerOpen}
          track={playerTrack}
          onPrev={() => currentIndex > 0 ? playAtIndex(currentIndex - 1) : undefined}
          onNext={() => currentIndex < rows.length - 1 ? playAtIndex(currentIndex + 1) : undefined}
        />
        <VideoPlayerDialog
          open={videoOpen}
          onOpenChange={setVideoOpen}
          track={videoTrack as any}
          onPrev={() => currentIndex > 0 ? playAtIndex(currentIndex - 1) : undefined}
          onNext={() => currentIndex < rows.length - 1 ? playAtIndex(currentIndex + 1) : undefined}
        />

        {/* Edit Music Dialog */}
        <Dialog open={!!editingMusic} onOpenChange={() => {
          setEditingMusic(null);
          setEditCurrentPage(1);
          setEditFile(null);
        }}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Music</DialogTitle>
              <DialogDescription>
                Update your music information (approved tracks cannot be edited)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {editCurrentPage === 1 ? (
                <MusicEditFormPage1 
                  form={editForm}
                  setForm={setEditForm}
                  lookups={lookups}
                />
              ) : (
                <MusicEditFormPage2 
                  form={editForm}
                  setForm={setEditForm}
                  editFile={editFile}
                  setEditFile={setEditFile}
                />
              )}

              <div className="flex justify-between">
                {editCurrentPage === 2 && (
                  <Button variant="outline" onClick={() => setEditCurrentPage(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
                
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" onClick={() => setEditingMusic(null)}>
                    Cancel
                  </Button>
                  
                  {editCurrentPage === 1 ? (
                    <Button onClick={() => setEditCurrentPage(2)}>
                      Next: File & Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleSaveEdit} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

// Music Edit Form Page 1 - Basic Information
const MusicEditFormPage1: React.FC<{
  form: any;
  setForm: (form: any) => void;
  lookups: { uploadTypes: ArtistUploadType[]; workTypes: ArtistWorkType[] };
}> = ({ form, setForm, lookups }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
  };

  return (
    <div className="space-y-6">
      {/* Basic Track Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Track Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input 
              id="title" 
              name="title" 
              value={form.title || ''} 
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="artist">Artist</Label>
            <Input 
              id="artist" 
              name="artist" 
              value={form.artist || ''} 
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="albumName">Album Name</Label>
            <Input 
              id="albumName" 
              name="albumName" 
              value={form.albumName || ''} 
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="groupOrBandOrStageName">Group/Band/Stage Name</Label>
            <Input 
              id="groupOrBandOrStageName" 
              name="groupOrBandOrStageName" 
              value={form.groupOrBandOrStageName || ''} 
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="featuredArtist">Featured Artist</Label>
            <Input 
              id="featuredArtist" 
              name="featuredArtist" 
              value={form.featuredArtist || ''} 
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="producer">Producer</Label>
            <Input 
              id="producer" 
              name="producer" 
              value={form.producer || ''} 
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input 
              id="duration" 
              name="duration" 
              value={form.duration || ''} 
              onChange={handleChange}
              placeholder="e.g., 3:45"
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input 
              id="country" 
              name="country" 
              value={form.country || ''} 
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Upload and Work Type */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Upload and Work Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="artistUploadTypeId">Upload Type</Label>
            <Select value={form.artistUploadTypeId?.toString() || ''} onValueChange={(value) => handleSelectChange('artistUploadTypeId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select upload type" />
              </SelectTrigger>
              <SelectContent>
                {lookups.uploadTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>{type.typeName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="artistWorkTypeId">Work Type</Label>
            <Select value={form.artistWorkTypeId?.toString() || ''} onValueChange={(value) => handleSelectChange('artistWorkTypeId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select work type" />
              </SelectTrigger>
              <SelectContent>
                {lookups.workTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>{type.workTypeName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Creative Credits */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Creative Credits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="composer">Composer</Label>
            <Input 
              id="composer" 
              name="composer" 
              value={form.composer || ''} 
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="author">Author</Label>
            <Input 
              id="author" 
              name="author" 
              value={form.author || ''} 
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="arranger">Arranger</Label>
            <Input 
              id="arranger" 
              name="arranger" 
              value={form.arranger || ''} 
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="publisher">Publisher</Label>
            <Input 
              id="publisher" 
              name="publisher" 
              value={form.publisher || ''} 
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="publishersName">Publisher's Name</Label>
            <Input 
              id="publishersName" 
              name="publishersName" 
              value={form.publishersName || ''} 
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="labelName">Label Name</Label>
            <Input 
              id="labelName" 
              name="labelName" 
              value={form.labelName || ''} 
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Music Edit Form Page 2 - File Upload and Recording Details
const MusicEditFormPage2: React.FC<{
  form: any;
  setForm: (form: any) => void;
  editFile: File | null;
  setEditFile: (file: File | null) => void;
}> = ({ form, setForm, editFile, setEditFile }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div>
        <h3 className="text-lg font-semibold mb-4">File Upload</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">New Audio/Video File *</Label>
            <Input 
              id="file" 
              type="file" 
              accept="audio/*,video/*" 
              onChange={(e) => setEditFile(e.target.files?.[0] || null)}
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Supported formats: MP3, WAV, M4A, MP4, AVI, MOV
            </p>
          </div>
          {editFile && (
            <div className="text-sm p-3 bg-muted rounded-lg">
              <p className="font-medium">{editFile.name}</p>
              <p className="text-muted-foreground">Size: {(editFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Recording Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recording Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="recordedBy">Recorded By</Label>
            <Input 
              id="recordedBy" 
              name="recordedBy" 
              value={form.recordedBy || ''} 
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="addressOfRecordingCompany">Recording Company Address</Label>
            <Input 
              id="addressOfRecordingCompany" 
              name="addressOfRecordingCompany" 
              value={form.addressOfRecordingCompany || ''} 
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="recordingCompanyTelephone">Recording Company Phone</Label>
            <Input 
              id="recordingCompanyTelephone" 
              name="recordingCompanyTelephone" 
              value={form.recordingCompanyTelephone || ''} 
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="dateRecorded">Date Recorded</Label>
            <Input 
              id="dateRecorded" 
              name="dateRecorded" 
              type="date"
              value={form.dateRecorded || ''} 
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Publisher Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Publisher Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="publisherAddress">Publisher Address</Label>
            <Input 
              id="publisherAddress" 
              name="publisherAddress" 
              value={form.publisherAddress || ''} 
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="publisherTelephone">Publisher Telephone</Label>
            <Input 
              id="publisherTelephone" 
              name="publisherTelephone" 
              value={form.publisherTelephone || ''} 
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistMyMusic;
