import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { adminAPI } from '@/services/api';
import { MemberDetails } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText, 
  Image, 
  User as UserIcon,
  Clock,
  AlertCircle
} from 'lucide-react';

const AdminPendingProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<MemberDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<MemberDetails | null>(null);
  const [profileDetails, setProfileDetails] = useState<any>(null);
  const [ipiNumber, setIpiNumber] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, []);

  // Listen for updates broadcast (e.g. from other admin windows) to refresh list
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key !== 'namsa:update') return;
      try {
        const payload = JSON.parse(e.newValue || '{}');
        if (payload?.type === 'profile') {
          loadProfiles();
          toast({ title: 'Profile Status Changed', description: 'A profile status was updated.' });
        }
      } catch (err) {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPendingProfiles();
      setProfiles(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load pending profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (profile: MemberDetails) => {
    try {
      setSelectedProfile(profile);
      setProfileDetails(null);
      setViewDialogOpen(true);
      
      // Fetch complete profile details including documents
      const fullData = await adminAPI.getUserDocuments(profile.user.id);
      setProfileDetails(fullData);
    } catch (error: any) {
      toast({
        title: 'Failed to load profile details',
        description: error?.response?.data || 'Error fetching user documents',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async () => {
    if (!selectedProfile || !ipiNumber.trim()) {
      toast({
        title: "IPI Number Required",
        description: "Please enter an IPI number for approval",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(selectedProfile.id);
      await adminAPI.approveProfile(selectedProfile.id, ipiNumber);
      toast({
        title: "Profile Approved",
        description: `${selectedProfile.firstName} ${selectedProfile.surname}'s profile has been approved`,
      });
      setIpiNumber('');
      // Broadcast update so clients can refresh (useful for artist dashboards)
      try { localStorage.setItem('namsa:update', JSON.stringify({ type: 'profile', userId: selectedProfile.user?.id || selectedProfile.id, status: 'APPROVED', timestamp: Date.now() })); } catch (e) {}
      setSelectedProfile(null);
      setApproveDialogOpen(false);
      loadProfiles();
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error?.response?.data?.message || "Failed to approve profile",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedProfile || !rejectionNotes.trim()) {
      toast({
        title: "Rejection Notes Required",
        description: "Please enter notes for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(selectedProfile.id);
      await adminAPI.rejectProfile(selectedProfile.id, rejectionNotes);
      toast({
        title: "Profile Rejected",
        description: `${selectedProfile.firstName} ${selectedProfile.surname}'s profile has been rejected`,
      });
      setRejectionNotes('');
      // Broadcast update so clients can refresh
      try { localStorage.setItem('namsa:update', JSON.stringify({ type: 'profile', userId: selectedProfile.user?.id || selectedProfile.id, status: 'REJECTED', timestamp: Date.now() })); } catch (e) {}
      setSelectedProfile(null);
      setRejectDialogOpen(false);
      loadProfiles();
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error?.response?.data?.message || "Failed to reject profile",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
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
      <DashboardLayout title="Pending Profiles">
        <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pending Profiles">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Profile Approvals</h1>
          <p className="text-muted-foreground">Review and approve/reject artist profiles</p>
        </div>

        {profiles.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No pending profiles to review</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Pending Profiles ({profiles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border rounded-lg">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-3 text-left">Name</th>
                      <th className="border border-border p-3 text-left">Email</th>
                      <th className="border border-border p-3 text-left">Phone</th>
                      <th className="border border-border p-3 text-left">Nationality</th>
                      <th className="border border-border p-3 text-left">Status</th>
                      <th className="border border-border p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-muted/50">
                        <td className="border border-border p-3 font-medium">
                          {profile.firstName} {profile.surname}
                        </td>
                        <td className="border border-border p-3">{profile.email}</td>
                        <td className="border border-border p-3">{profile.phoneNumber}</td>
                        <td className="border border-border p-3">{profile.nationality || '-'}</td>
                        <td className="border border-border p-3">
                          {getStatusBadge((profile.status?.statusName || (profile as any).status?.status || 'PENDING'))}
                        </td>
                        <td className="border border-border p-3">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewProfile(profile)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Profile
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedProfile(profile);
                                setApproveDialogOpen(true);
                              }}
                              disabled={processing === profile.id}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedProfile(profile);
                                setRejectDialogOpen(true);
                              }}
                              disabled={processing === profile.id}
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

        {/* View Profile Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Profile Review</DialogTitle>
            </DialogHeader>
            
            {selectedProfile && (
              <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Profile Details
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Member Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label>First Name</Label>
                        <Input value={profileDetails?.memberDetails?.firstName || selectedProfile.firstName} disabled />
                      </div>
                      <div>
                        <Label>Surname</Label>
                        <Input value={profileDetails?.memberDetails?.surname || selectedProfile.surname} disabled />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input value={profileDetails?.memberDetails?.email || selectedProfile.email} disabled />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input value={profileDetails?.memberDetails?.phoneNumber || selectedProfile.phoneNumber} disabled />
                      </div>
                      <div>
                        <Label>ID Number</Label>
                        <Input value={profileDetails?.memberDetails?.idNumber || selectedProfile.idNumber || '-'} disabled />
                      </div>
                      <div>
                        <Label>Artist ID</Label>
                        <Input value={profileDetails?.memberDetails?.artistId || (selectedProfile as any).artistId || (selectedProfile as any).ArtistId || '-'} disabled />
                      </div>
                      <div>
                        <Label>IPI Number</Label>
                        <Input value={profileDetails?.memberDetails?.ipi_number || (selectedProfile as any).ipi_number || (selectedProfile as any).IPI_number || '-'} disabled />
                      </div>
                      <div>
                        <Label>Nationality</Label>
                        <Input value={profileDetails?.memberDetails?.nationality || selectedProfile.nationality || '-'} disabled />
                      </div>
                      <div>
                        <Label>Occupation</Label>
                        <Input value={profileDetails?.memberDetails?.occupation || selectedProfile.occupation || '-'} disabled />
                      </div>
                      <div>
                        <Label>Birth Date</Label>
                        <Input value={profileDetails?.memberDetails?.birthDate || selectedProfile.birthDate || '-'} disabled />
                      </div>
                      <div>
                        <Label>Place of Birth</Label>
                        <Input value={profileDetails?.memberDetails?.placeOfBirth || selectedProfile.placeOfBirth || '-'} disabled />
                      </div>
                      <div>
                        <Label>Bank Account</Label>
                        <Input value={profileDetails?.memberDetails?.bankAccountNumber || selectedProfile.bankAccountNumber || '-'} disabled />
                      </div>
                      <div>
                        <Label>Account Holder</Label>
                        <Input value={profileDetails?.memberDetails?.accountHolderName || selectedProfile.accountHolderName || '-'} disabled />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="pt-2">
                          {getStatusBadge(profileDetails?.memberDetails?.status?.status || selectedProfile.status?.statusName || 'PENDING')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {(profileDetails?.memberDetails?.notes || selectedProfile.notes) && (
                    <>
                      <Separator />
                      <div>
                        <Label>Admin Notes</Label>
                        <Textarea 
                          value={profileDetails?.memberDetails?.notes || selectedProfile.notes || ''} 
                          disabled 
                          rows={3} 
                        />
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
                    <div className="space-y-4">
                      {profileDetails?.passportPhoto ? (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Image className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">Passport Photo</p>
                              <p className="text-sm text-muted-foreground">{profileDetails.passportPhoto.imageTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded: {new Date(profileDetails.passportPhoto.datePosted).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(profileDetails.passportPhoto.imageUrl, '_blank')}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                          <span className="text-muted-foreground">Passport Photo - Not uploaded</span>
                        </div>
                      )}

                      {profileDetails?.idDocument ? (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">ID Document</p>
                              <p className="text-sm text-muted-foreground">{profileDetails.idDocument.documentTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded: {new Date(profileDetails.idDocument.datePosted).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(profileDetails.idDocument.fileUrl, '_blank')}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                          <span className="text-muted-foreground">ID Document - Not uploaded</span>
                        </div>
                      )}

                      {profileDetails?.bankConfirmationLetter ? (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="font-medium">Bank Confirmation Letter</p>
                              <p className="text-sm text-muted-foreground">{profileDetails.bankConfirmationLetter.documentTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded: {new Date(profileDetails.bankConfirmationLetter.datePosted).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(profileDetails.bankConfirmationLetter.fileUrl, '_blank')}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                          <span className="text-muted-foreground">Bank Confirmation Letter - Not uploaded</span>
                        </div>
                      )}

                      {profileDetails?.proofOfPayment ? (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-orange-600" />
                            <div>
                              <p className="font-medium">Proof of Payment</p>
                              <p className="text-sm text-muted-foreground">{profileDetails.proofOfPayment.documentTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded: {new Date(profileDetails.proofOfPayment.datePosted).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(profileDetails.proofOfPayment.fileUrl, '_blank')}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                          <span className="text-muted-foreground">Proof of Payment - Not uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Approve Profile</DialogTitle>
            </DialogHeader>
            
            {selectedProfile && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{selectedProfile.firstName} {selectedProfile.surname}</p>
                  <p className="text-sm text-muted-foreground">{selectedProfile.email}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ipiNumber">IPI Number *</Label>
                  <Input
                    id="ipiNumber"
                    value={ipiNumber}
                    onChange={(e) => setIpiNumber(e.target.value)}
                    placeholder="Enter IPI number"
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setApproveDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleApprove} 
                    disabled={processing === selectedProfile.id || !ipiNumber.trim()}
                    className="flex-1 bg-namsa-success hover:bg-namsa-success/90"
                  >
                    {processing === selectedProfile.id ? 'Processing...' : 'Approve Profile'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Profile</DialogTitle>
            </DialogHeader>
            
            {selectedProfile && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{selectedProfile.firstName} {selectedProfile.surname}</p>
                  <p className="text-sm text-muted-foreground">{selectedProfile.email}</p>
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
                    disabled={processing === selectedProfile.id || !rejectionNotes.trim()}
                    className="flex-1"
                  >
                    {processing === selectedProfile.id ? 'Processing...' : 'Reject Profile'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminPendingProfiles;
