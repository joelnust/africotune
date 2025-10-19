import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column, Action } from '@/components/common/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { LogSheet, ArtistWork } from '@/types';
import { FileMusic, Video, Play, Eye } from 'lucide-react';
import MusicPlayerDialog from '@/components/common/MusicPlayerDialog';
import VideoPlayerDialog from '@/components/common/VideoPlayerDialog';

const AdminLogSheets: React.FC = () => {
  const [logSheets, setLogSheets] = useState<LogSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogSheet, setSelectedLogSheet] = useState<LogSheet | null>(null);
  const [logSheetDialogOpen, setLogSheetDialogOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<ArtistWork | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadLogSheets = async () => {
      try {
        setLoading(true);
        const data = await adminAPI.getAllLogSheets();
        setLogSheets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load logsheets:', error);
        toast({
          title: "Error",
          description: "Failed to load logsheets",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadLogSheets();
  }, [toast]);

  const isVideo = (track: ArtistWork) => {
    const ft = (track.fileType || '').toLowerCase();
    return ft.startsWith('video') || /(.mp4|.mov|.avi|.mkv|.webm)$/.test(track.fileUrl || '');
  };

  const handlePlayTrack = (track: ArtistWork) => {
    if (!track.fileUrl) {
      toast({ title: 'Media Not Available', description: 'No media file available for this track', variant: 'destructive' });
      return;
    }
    setCurrentTrack(track);
    if (isVideo(track)) {
      setVideoOpen(true);
      setPlayerOpen(false);
    } else {
      setPlayerOpen(true);
      setVideoOpen(false);
    }
  };

  const columns: Column<LogSheet>[] = [
    { 
      key: 'title', 
      header: 'Title', 
      accessor: 'title' 
    },
    { 
      key: 'company', 
      header: 'Company', 
      accessor: (item) => item.company?.companyName || 'Unknown Company' 
    },
    { 
      key: 'date', 
      header: 'Date', 
      accessor: 'createdDate',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'songs', 
      header: 'Selected Songs', 
      accessor: (item) => item.selectedMusic?.length || 0
    }
  ];

  const actions: Action<LogSheet>[] = [
    {
      label: 'View',
      icon: Eye,
      onClick: (logsheet) => {
        setSelectedLogSheet(logsheet);
        setLogSheetDialogOpen(true);
      }
    }
  ];

  return (
    <DashboardLayout title="All LogSheets">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">All LogSheets</h1>
        </div>

        <DataTable
          data={logSheets}
          columns={columns}
          actions={actions}
          loading={loading}
          searchable={true}
          emptyMessage="No logsheets available"
        />

        {/* LogSheet Details Dialog */}
        <Dialog open={logSheetDialogOpen} onOpenChange={setLogSheetDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">LogSheet Details</DialogTitle>
            </DialogHeader>
            {selectedLogSheet ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Title</div>
                    <div className="font-semibold">{selectedLogSheet.title}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Company</div>
                    <div className="font-semibold">{selectedLogSheet.company?.companyName || 'Unknown Company'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Created Date</div>
                    <div className="font-semibold">{new Date(selectedLogSheet.createdDate).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Tracks</div>
                    <div className="font-semibold">{selectedLogSheet.selectedMusic?.length || 0}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Selected Tracks</div>
                  <div className="space-y-2">
                    {!selectedLogSheet.selectedMusic || selectedLogSheet.selectedMusic.length === 0 ? (
                      <div className="text-muted-foreground">No tracks selected.</div>
                    ) : (
                      <div className="border rounded-lg divide-y">
                        {selectedLogSheet.selectedMusic.map((track: ArtistWork) => (
                          <div key={track.id} className="flex items-center justify-between p-4 hover:bg-accent">
                            <div className="flex items-center gap-4 flex-1">
                              {isVideo(track) ? <Video className="h-5 w-5" /> : <FileMusic className="h-5 w-5" />}
                              <div>
                                <div className="font-semibold">{track.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {track.artist || track.user?.name || track.user?.email || 'Unknown Artist'}
                                </div>
                                {track.albumName && (
                                  <div className="text-xs text-muted-foreground">Album: {track.albumName}</div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {track.duration && (
                                <div className="text-sm text-muted-foreground">{track.duration}</div>
                              )}
                              {track.fileUrl && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handlePlayTrack(track)}
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Play
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Company Details</div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Contact Person</div>
                      <div className="font-semibold">{selectedLogSheet.company?.contactPerson || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="font-semibold">{selectedLogSheet.company?.companyEmail || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Phone</div>
                      <div className="font-semibold">{selectedLogSheet.company?.companyPhone || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Address</div>
                      <div className="font-semibold">{selectedLogSheet.company?.companyAddress || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">LogSheet details not available.</div>
            )}
          </DialogContent>
        </Dialog>

        {/* Media Players */}
        {currentTrack && (
          isVideo(currentTrack) ? (
            <VideoPlayerDialog 
              open={videoOpen} 
              onOpenChange={setVideoOpen} 
              track={currentTrack ? {
                id: currentTrack.id,
                title: currentTrack.title,
                artist: currentTrack.artist,
                fileUrl: currentTrack.fileUrl,
                fileType: currentTrack.fileType
              } : null} 
            />
          ) : (
            <MusicPlayerDialog 
              open={playerOpen} 
              onOpenChange={setPlayerOpen} 
              track={currentTrack ? {
                id: currentTrack.id,
                title: currentTrack.title,
                artist: currentTrack.artist,
                fileUrl: currentTrack.fileUrl,
                fileType: currentTrack.fileType,
                duration: currentTrack.duration
              } : null} 
            />
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminLogSheets;