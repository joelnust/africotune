import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Music, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MusicUploadSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  musicTitle?: string;
}

const MusicUploadSuccessDialog: React.FC<MusicUploadSuccessDialogProps> = ({
  open,
  onOpenChange,
  musicTitle
}) => {
  const navigate = useNavigate();

  const handleViewMusic = () => {
    onOpenChange(false);
    navigate('/artist/music');
  };

  const handleViewPerformance = () => {
    onOpenChange(false);
    navigate('/artist/performance');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-namsa-success/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-namsa-success" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Upload Successful!</DialogTitle>
          <DialogDescription className="text-center text-base">
            {musicTitle ? (
              <>
                <span className="font-medium">"{musicTitle}"</span> has been uploaded successfully and is now pending review.
              </>
            ) : (
              'Your music has been uploaded successfully and is now pending review.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <Button
            onClick={handleViewMusic}
            className="w-full bg-gradient-namsa hover:opacity-90"
            size="lg"
          >
            <Music className="w-5 h-5 mr-2" />
            View My Music
          </Button>
          <Button
            onClick={handleViewPerformance}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Track Performance
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-4">
          You'll be notified once your music is reviewed and approved.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default MusicUploadSuccessDialog;
