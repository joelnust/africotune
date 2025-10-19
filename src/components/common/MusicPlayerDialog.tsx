import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Minimize2, X } from 'lucide-react';

type Track = {
  id: number;
  title: string;
  artist?: string;
  fileUrl: string;
  fileType?: string;
  duration?: string;
};

interface MusicPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track: Track | null;
  onMinimize?: () => void;
  // Optional callbacks for prev/next support
  onPrev?: () => void;
  onNext?: () => void;
}

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const MusicPlayerDialog: React.FC<MusicPlayerDialogProps> = ({ open, onOpenChange, track, onMinimize, onPrev, onNext }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  const src = useMemo(() => track?.fileUrl || '', [track]);

  useEffect(() => {
    if (!open) {
      // pause when closed
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [open]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    // reset on track change
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [src]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleSeek = (values: number[]) => {
    const value = values[0];
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolume = (values: number[]) => {
    const value = values[0];
    setVolume(value);
    setMuted(value === 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {track ? `${track.title}${track.artist ? ' — ' + track.artist : ''}` : 'Music Player'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <audio
            ref={audioRef}
            onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
            onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
            onEnded={() => setIsPlaying(false)}
            controls={false}
          >
            {src && <source src={src} />}
          </audio>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground flex justify-between">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <Slider value={[Math.min(currentTime, duration || 0)]} max={duration || 0} step={1} onValueChange={handleSeek} />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={onPrev} disabled={!onPrev}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button variant="outline" size="icon" onClick={onNext} disabled={!onNext}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 w-40">
              <Button variant="ghost" size="icon" onClick={() => setMuted((m) => !m)}>
                {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider value={[muted ? 0 : volume]} max={1} step={0.01} onValueChange={handleVolume} />
            </div>

            <div className="flex items-center gap-2">
              {onMinimize && (
                <Button variant="outline" size="icon" onClick={onMinimize}>
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MusicPlayerDialog;


