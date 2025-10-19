import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { companyAPI } from '@/services/api';
import { ArtistWork } from '@/types';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle,
  Download,
  Music,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompanyAudioPlayer: React.FC = () => {
  const [playlist, setPlaylist] = useState<ArtistWork[]>([]);
  const [currentTrack, setCurrentTrack] = useState<ArtistWork | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        setLoading(true);
        const data = await companyAPI.getApprovedMusic();
        setPlaylist(data);
        if (data.length > 0) {
          setCurrentTrack(data[0]);
        }
      } catch (error) {
        console.error('Failed to load playlist:', error);
        toast({
          title: "Error",
          description: "Failed to load music playlist",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();
  }, [toast]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (!currentTrack) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    let nextIndex;
    
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) nextIndex = 0;
    }
    
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(false);
  };

  const playPrevious = () => {
    if (!currentTrack) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex - 1 < 0 ? playlist.length - 1 : currentIndex - 1;
    
    setCurrentTrack(playlist[prevIndex]);
    setIsPlaying(false);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    audio.volume = newVolume / 100;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume / 100;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const downloadTrack = () => {
    if (!currentTrack?.fileUrl) return;
    
    const link = document.createElement('a');
    link.href = currentTrack.fileUrl;
    link.download = `${currentTrack.title}.${currentTrack.fileType || 'mp3'}`;
    link.click();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <DashboardLayout title="Audio Player">
        <div className="space-y-6 animate-pulse">
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Audio Player">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold tracking-tight">Audio Player</h1>
          <p className="text-muted-foreground">
            Play and manage your approved music library
          </p>
          </div>
          <Button onClick={() => navigate('/company/logsheet/create')} className="gap-2">Create Log Sheet</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Player */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-namsa text-primary-foreground">
              <CardContent className="p-8">
                {currentTrack ? (
                  <>
                    <audio
                      ref={audioRef}
                      src={currentTrack.fileUrl}
                      onLoadedData={() => {
                        if (isPlaying) {
                          audioRef.current?.play();
                        }
                      }}
                    />
                    
                    {/* Track Info */}
                    <div className="text-center mb-8">
                      <div className="w-32 h-32 mx-auto mb-4 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                        <Music className="w-16 h-16" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">{currentTrack.title}</h2>
                      <p className="text-primary-foreground/80 text-lg">{currentTrack.artist}</p>
                      <p className="text-primary-foreground/60">{currentTrack.albumName}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 mb-6">
                      <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={1}
                        onValueChange={handleSeek}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-primary-foreground/80">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={`text-primary-foreground hover:bg-primary-foreground/20 ${isShuffle ? 'bg-primary-foreground/20' : ''}`}
                      >
                        <Shuffle className="w-5 h-5" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={playPrevious}
                        className="text-primary-foreground hover:bg-primary-foreground/20"
                      >
                        <SkipBack className="w-6 h-6" />
                      </Button>
                      
                      <Button
                        onClick={togglePlay}
                        size="lg"
                        className="w-16 h-16 rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                      >
                        {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={playNext}
                        className="text-primary-foreground hover:bg-primary-foreground/20"
                      >
                        <SkipForward className="w-6 h-6" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsRepeat(!isRepeat)}
                        className={`text-primary-foreground hover:bg-primary-foreground/20 ${isRepeat ? 'bg-primary-foreground/20' : ''}`}
                      >
                        <Repeat className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Volume & Additional Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleMute}
                          className="text-primary-foreground hover:bg-primary-foreground/20"
                        >
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </Button>
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          max={100}
                          step={1}
                          onValueChange={handleVolumeChange}
                          className="w-24"
                        />
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={downloadTrack}
                        className="text-primary-foreground hover:bg-primary-foreground/20"
                      >
                        <Download className="w-5 h-5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-primary-foreground/80">No track selected</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Playlist */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Playlist</CardTitle>
                <CardDescription>{playlist.length} tracks available</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {playlist.map((track, index) => (
                    <div
                      key={track.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        currentTrack?.id === track.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => {
                        setCurrentTrack(track);
                        setIsPlaying(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{track.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{track.duration || '0:00'}</span>
                          {currentTrack?.id === track.id && (
                            <Badge variant="default" className="bg-gradient-namsa">
                              Playing
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyAudioPlayer;