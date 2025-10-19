import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { artistAPI, lookupAPI } from '@/services/api';
import { MemberDetails, MusicUploadForm, ArtistUploadType, ArtistWorkType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import MusicUploadSuccessDialog from '@/components/common/MusicUploadSuccessDialog';

const ArtistUpload: React.FC = () => {
  const [form, setForm] = useState<MusicUploadForm>({
    title: '',
    file: null as any,
  });
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<MemberDetails | null>(null);
  const [lookups, setLookups] = useState<{ uploadTypes: ArtistUploadType[]; workTypes: ArtistWorkType[] }>({
    uploadTypes: [],
    workTypes: [],
  });
  const [successOpen, setSuccessOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load profile
        const p = await artistAPI.getProfile();
        setProfile(p);

        // Load lookups
        const [uploadTypes, workTypes] = await Promise.all([
          lookupAPI.getArtistUploadTypes().catch(() => []),
          lookupAPI.getArtistWorkTypes().catch(() => []),
        ]);

        setLookups({
          uploadTypes,
          workTypes,
        });
      } catch (error) {
        // Profile doesn't exist yet
      }
    };
    loadData();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key !== 'namsa:update') return;
      try {
        const payload = JSON.parse(e.newValue || '{}');
        if (payload?.type === 'profile' && payload.userId) {
          // If the update concerns this user, reload profile
          artistAPI.getProfile().then(setProfile).catch(() => {});
          toast({ title: 'Profile Status Updated', description: 'Your profile status was updated by an admin.' });
        }
      } catch (err) {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, file }));
  };

  const handleUpload = async () => {
    // Pre-checks for user, role, and approval status
    if (!user) {
      toast({ title: 'Please sign in', description: 'You must be signed in to upload music.', variant: 'destructive' });
      return;
    }
    if (user.role !== 'ARTIST') {
      toast({ title: 'Not permitted', description: 'Only artist accounts can upload music.', variant: 'destructive' });
      return;
    }
    if (profile && ((profile.status?.statusName || (profile as any).status?.status) !== 'APPROVED')) {
      toast({ title: 'Profile not approved', description: 'Your profile must be approved before you can upload music.', variant: 'destructive' });
      return;
    }
    if (!form.file || !form.title.trim() || !(form as any).ArtistId?.toString().trim()) {
      toast({
        title: "Error",
        description: "Please select a file, enter a title, and provide your ArtistId",
        variant: "destructive",
      });
      return;
    }
    if (!form.artistUploadTypeId || !form.artistWorkTypeId) {
      toast({
        title: 'Missing required fields',
        description: 'Please select Upload Type and Work Type before uploading.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await artistAPI.uploadMusic(form);
      setForm({
        title: '',
        file: null as any,
      });
      setSuccessOpen(true);
      toast({
        title: "Upload Successful",
        description: "Your music has been uploaded successfully!",
      });
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;
      if (status === 403) {
        toast({
          title: 'Upload Forbidden',
          description: message || 'Access denied. Ensure you are logged in as an ARTIST and your profile is approved.',
          variant: 'destructive',
        });
      } else if (status === 401) {
        toast({ title: 'Unauthorized', description: 'Your session may have expired. Please sign in again.', variant: 'destructive' });
      } else {
        toast({
          title: 'Upload Failed',
          description: message || 'Failed to upload music',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Upload Music">
      <Card>
        <CardHeader>
          <CardTitle>Upload Music</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile && ((profile.status?.statusName || (profile as any).status?.status) !== 'APPROVED') && (
            <div className="p-3 rounded border border-yellow-200 bg-yellow-50 text-sm text-yellow-800">
              Your profile is not approved yet. You cannot upload music until approval.
            </div>
          )}
          {!user && (
            <div className="p-3 rounded border border-yellow-200 bg-yellow-50 text-sm text-yellow-800">
              Please sign in to upload music.
            </div>
          )}
          
          {/* Basic Track Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Track Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ArtistId">ArtistId *</Label>
                <Input 
                  id="ArtistId" 
                  name="ArtistId" 
                  value={(form as any).ArtistId || ''} 
                  onChange={(e) => setForm(prev => ({ ...prev, ArtistId: e.target.value }))}
                  placeholder="Enter your ArtistId"
                  required
                />
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange}
                  placeholder="Enter song title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="albumName">Album Name</Label>
                <Input 
                  id="albumName" 
                  name="albumName" 
                  value={form.albumName || ''} 
                  onChange={handleChange}
                  placeholder="Enter album name"
                />
              </div>
              <div>
                <Label htmlFor="artist">Artist</Label>
                <Input 
                  id="artist" 
                  name="artist" 
                  value={form.artist || ''} 
                  onChange={handleChange}
                  placeholder="Enter artist name"
                />
              </div>
              <div>
                <Label htmlFor="groupOrBandOrStageName">Group/Band/Stage Name</Label>
                <Input 
                  id="groupOrBandOrStageName" 
                  name="groupOrBandOrStageName" 
                  value={form.groupOrBandOrStageName || ''} 
                  onChange={handleChange}
                  placeholder="Enter group/band/stage name"
                />
              </div>
              <div>
                <Label htmlFor="featuredArtist">Featured Artist</Label>
                <Input 
                  id="featuredArtist" 
                  name="featuredArtist" 
                  value={form.featuredArtist || ''} 
                  onChange={handleChange}
                  placeholder="Enter featured artist"
                />
              </div>
              <div>
                <Label htmlFor="producer">Producer</Label>
                <Input 
                  id="producer" 
                  name="producer" 
                  value={form.producer || ''} 
                  onChange={handleChange}
                  placeholder="Enter producer name"
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
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>

          {/* Upload and Work Type */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Upload and Work Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="artistUploadTypeId">Upload Type</Label>
                <Select value={form.artistUploadTypeId?.toString() || ''} onValueChange={(value) => setForm(prev => ({ ...prev, artistUploadTypeId: value ? parseInt(value) : undefined }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select upload type (required)" />
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
                <Select value={form.artistWorkTypeId?.toString() || ''} onValueChange={(value) => setForm(prev => ({ ...prev, artistWorkTypeId: value ? parseInt(value) : undefined }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work type (required)" />
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
                  placeholder="Enter composer name"
                />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input 
                  id="author" 
                  name="author" 
                  value={form.author || ''} 
                  onChange={handleChange}
                  placeholder="Enter author name"
                />
              </div>
              <div>
                <Label htmlFor="arranger">Arranger</Label>
                <Input 
                  id="arranger" 
                  name="arranger" 
                  value={form.arranger || ''} 
                  onChange={handleChange}
                  placeholder="Enter arranger name"
                />
              </div>
              <div>
                <Label htmlFor="publisher">Publisher</Label>
                <Input 
                  id="publisher" 
                  name="publisher" 
                  value={form.publisher || ''} 
                  onChange={handleChange}
                  placeholder="Enter publisher name"
                />
              </div>
              <div>
                <Label htmlFor="publishersName">Publisher's Name</Label>
                <Input 
                  id="publishersName" 
                  name="publishersName" 
                  value={form.publishersName || ''} 
                  onChange={handleChange}
                  placeholder="Enter publisher's name"
                />
              </div>
              <div>
                <Label htmlFor="publisherAddress">Publisher Address</Label>
                <Input 
                  id="publisherAddress" 
                  name="publisherAddress" 
                  value={form.publisherAddress || ''} 
                  onChange={handleChange}
                  placeholder="Enter publisher address"
                />
              </div>
              <div>
                <Label htmlFor="publisherTelephone">Publisher Telephone</Label>
                <Input 
                  id="publisherTelephone" 
                  name="publisherTelephone" 
                  value={form.publisherTelephone || ''} 
                  onChange={handleChange}
                  placeholder="Enter publisher telephone"
                />
              </div>
            </div>
          </div>

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
                  placeholder="Enter recording engineer"
                />
              </div>
              <div>
                <Label htmlFor="addressOfRecordingCompany">Recording Company Address</Label>
                <Input 
                  id="addressOfRecordingCompany" 
                  name="addressOfRecordingCompany" 
                  value={form.addressOfRecordingCompany || ''} 
                  onChange={handleChange}
                  placeholder="Enter recording company address"
                />
              </div>
              <div>
                <Label htmlFor="recordingCompanyTelephone">Recording Company Telephone</Label>
                <Input 
                  id="recordingCompanyTelephone" 
                  name="recordingCompanyTelephone" 
                  value={form.recordingCompanyTelephone || ''} 
                  onChange={handleChange}
                  placeholder="Enter recording company telephone"
                />
              </div>
              <div>
                <Label htmlFor="labelName">Label Name</Label>
                <Input 
                  id="labelName" 
                  name="labelName" 
                  value={form.labelName || ''} 
                  onChange={handleChange}
                  placeholder="Enter record label name"
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

          {/* File Upload */}
          <div>
            <h3 className="text-lg font-semibold mb-4">File Upload</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Audio/Video File *</Label>
                <Input 
                  id="file" 
                  type="file" 
                  accept="audio/*,video/*" 
                  onChange={handleFileChange}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: MP3, WAV, M4A, MP4, AVI, MOV
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={loading || !form.file || !form.title.trim() || (profile && ((profile.status?.statusName || (profile as any).status?.status) !== 'APPROVED'))}
            className="w-full"
          >
            {loading ? 'Uploading...' : 'Upload Music'}
          </Button>
        </CardContent>
      </Card>
      <MusicUploadSuccessDialog open={successOpen} onOpenChange={setSuccessOpen} musicTitle={form.title} />
    </DashboardLayout>
  );
};

export default ArtistUpload;
