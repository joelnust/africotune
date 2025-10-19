import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { artistAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Upload, Eye, Edit, FileText, Image, CheckCircle } from 'lucide-react';

const ArtistDocuments: React.FC = () => {
  const [currentUploads, setCurrentUploads] = useState<Record<string, { file: File | null; title: string }>>({
    passportPhoto: { file: null, title: 'Passport Photo' },
    idDocument: { file: null, title: 'ID Document' },
    bankConfirmationLetter: { file: null, title: 'Bank Confirmation Letter' },
    proofOfPayment: { file: null, title: 'Proof of Payment' },
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [documents, setDocuments] = useState<any>({});
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const docs = await artistAPI.getDocuments();
        setDocuments(docs);
      } catch (error) {
        // Documents don't exist yet
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleIndividualUpload = async (documentType: string) => {
    const uploadData = currentUploads[documentType];
    if (!uploadData.file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(prev => ({ ...prev, [documentType]: true }));
      
      switch (documentType) {
        case 'passportPhoto':
          if (editMode) {
            await artistAPI.updatePassportPhotoByUser(uploadData.file, uploadData.title);
          } else {
            await artistAPI.uploadPassportPhoto(uploadData.file, uploadData.title);
          }
          break;
        case 'idDocument':
          if (editMode) {
            await artistAPI.updateIdDocumentByUser(uploadData.file, uploadData.title);
          } else {
            await artistAPI.uploadIdDocument(uploadData.file, uploadData.title);
          }
          break;
        case 'bankConfirmationLetter':
          if (editMode) {
            await artistAPI.updateBankLetterByUser(uploadData.file, uploadData.title);
          } else {
            await artistAPI.uploadBankConfirmationLetter(uploadData.file, uploadData.title);
          }
          break;
        case 'proofOfPayment':
          if (editMode) {
            await artistAPI.updateProofOfPaymentByUser(uploadData.file, uploadData.title);
          } else {
            await artistAPI.uploadProofOfPayment(uploadData.file, uploadData.title);
          }
          break;
      }

      // Clear the upload
      setCurrentUploads(prev => ({
        ...prev,
        [documentType]: { file: null, title: uploadData.title }
      }));
      
      toast({
        title: "Upload Successful",
        description: `${uploadData.title} uploaded successfully!`,
      });
      
      // Reload documents
      const docs = await artistAPI.getDocuments();
      setDocuments(docs);
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error?.response?.data?.message || `Failed to upload ${uploadData.title}`,
        variant: "destructive",
      });
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const updateUpload = (documentType: string, field: 'file' | 'title', value: any) => {
    setCurrentUploads(prev => ({
      ...prev,
      [documentType]: {
        ...prev[documentType],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <DashboardLayout title="Documents">
        <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Documents">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
            <p className="text-muted-foreground">
              {editMode ? 'Edit and replace your previously uploaded documents' : 'Upload and manage your required documents individually'}
            </p>
          </div>
          <Button variant="outline" onClick={() => setEditMode((v) => !v)}>
            {editMode ? 'Exit Edit Mode' : 'Edit Documents'}
          </Button>
        </div>

        {/* Current Documents */}
        {(documents.passportPhoto || documents.idDocument || documents.bankConfirmationLetter || documents.proofOfPayment) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-namsa-success" />
                Uploaded Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {documents.passportPhoto && (
                <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Passport Photo
                    </p>
                    <p className="text-sm text-gray-500">{documents.passportPhoto.imageTitle}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(documents.passportPhoto.imageUrl, '_blank')}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Badge variant="default" className="bg-namsa-success">Uploaded</Badge>
                  </div>
                </div>
              )}
              {documents.idDocument && (
                <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      ID Document
                    </p>
                    <p className="text-sm text-gray-500">{documents.idDocument.documentTitle}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(documents.idDocument.fileUrl, '_blank')}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Badge variant="default" className="bg-namsa-success">Uploaded</Badge>
                  </div>
                </div>
              )}
              {documents.bankConfirmationLetter && (
                <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Bank Confirmation Letter
                    </p>
                    <p className="text-sm text-gray-500">{documents.bankConfirmationLetter.documentTitle}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(documents.bankConfirmationLetter.fileUrl, '_blank')}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Badge variant="default" className="bg-namsa-success">Uploaded</Badge>
                  </div>
                </div>
              )}
              {documents.proofOfPayment && (
                <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Proof of Payment
                    </p>
                    <p className="text-sm text-gray-500">{documents.proofOfPayment.documentTitle}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(documents.proofOfPayment.fileUrl, '_blank')}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Badge variant="default" className="bg-namsa-success">Uploaded</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upload New Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Passport Photo */}
            <Card className="border-dashed">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Passport Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Title</Label>
                  <Input
                    value={currentUploads.passportPhoto.title}
                    onChange={(e) => updateUpload('passportPhoto', 'title', e.target.value)}
                    placeholder="Enter document title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select Image File</Label>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => updateUpload('passportPhoto', 'file', e.target.files?.[0] || null)} 
                  />
                </div>
                {currentUploads.passportPhoto.file && (
                  <div className="text-sm p-3 bg-muted rounded-lg">
                    <p className="font-medium">{currentUploads.passportPhoto.file.name}</p>
                    <p className="text-muted-foreground">Size: {(currentUploads.passportPhoto.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleIndividualUpload('passportPhoto')}
                    disabled={!currentUploads.passportPhoto.file || uploading.passportPhoto}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading.passportPhoto ? 'Uploading...' : editMode ? 'Save New Photo' : 'Upload Photo'}
                  </Button>
                  {documents.passportPhoto && (
                    <Button variant="outline" onClick={() => window.open(documents.passportPhoto.imageUrl, '_blank')}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Current
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ID Document */}
            <Card className="border-dashed">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  ID Document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Title</Label>
                  <Input
                    value={currentUploads.idDocument.title}
                    onChange={(e) => updateUpload('idDocument', 'title', e.target.value)}
                    placeholder="Enter document title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select PDF File</Label>
                  <Input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={(e) => updateUpload('idDocument', 'file', e.target.files?.[0] || null)} 
                  />
                </div>
                {currentUploads.idDocument.file && (
                  <div className="text-sm p-3 bg-muted rounded-lg">
                    <p className="font-medium">{currentUploads.idDocument.file.name}</p>
                    <p className="text-muted-foreground">Size: {(currentUploads.idDocument.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleIndividualUpload('idDocument')}
                    disabled={!currentUploads.idDocument.file || uploading.idDocument}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading.idDocument ? 'Uploading...' : editMode ? 'Save New Document' : 'Upload Document'}
                  </Button>
                  {documents.idDocument && (
                    <Button variant="outline" onClick={() => window.open(documents.idDocument.fileUrl, '_blank')}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Current
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bank Confirmation Letter */}
            <Card className="border-dashed">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Bank Confirmation Letter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Title</Label>
                  <Input
                    value={currentUploads.bankConfirmationLetter.title}
                    onChange={(e) => updateUpload('bankConfirmationLetter', 'title', e.target.value)}
                    placeholder="Enter document title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select PDF File</Label>
                  <Input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={(e) => updateUpload('bankConfirmationLetter', 'file', e.target.files?.[0] || null)} 
                  />
                </div>
                {currentUploads.bankConfirmationLetter.file && (
                  <div className="text-sm p-3 bg-muted rounded-lg">
                    <p className="font-medium">{currentUploads.bankConfirmationLetter.file.name}</p>
                    <p className="text-muted-foreground">Size: {(currentUploads.bankConfirmationLetter.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleIndividualUpload('bankConfirmationLetter')}
                    disabled={!currentUploads.bankConfirmationLetter.file || uploading.bankConfirmationLetter}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading.bankConfirmationLetter ? 'Uploading...' : editMode ? 'Save New Letter' : 'Upload Letter'}
                  </Button>
                  {documents.bankConfirmationLetter && (
                    <Button variant="outline" onClick={() => window.open(documents.bankConfirmationLetter.fileUrl, '_blank')}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Current
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Proof of Payment */}
            <Card className="border-dashed">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Proof of Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Title</Label>
                  <Input
                    value={currentUploads.proofOfPayment.title}
                    onChange={(e) => updateUpload('proofOfPayment', 'title', e.target.value)}
                    placeholder="Enter document title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select PDF File</Label>
                  <Input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={(e) => updateUpload('proofOfPayment', 'file', e.target.files?.[0] || null)} 
                  />
                </div>
                {currentUploads.proofOfPayment.file && (
                  <div className="text-sm p-3 bg-muted rounded-lg">
                    <p className="font-medium">{currentUploads.proofOfPayment.file.name}</p>
                    <p className="text-muted-foreground">Size: {(currentUploads.proofOfPayment.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleIndividualUpload('proofOfPayment')}
                    disabled={!currentUploads.proofOfPayment.file || uploading.proofOfPayment}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading.proofOfPayment ? 'Uploading...' : editMode ? 'Save New Proof' : 'Upload Proof'}
                  </Button>
                  {documents.proofOfPayment && (
                    <Button variant="outline" onClick={() => window.open(documents.proofOfPayment.fileUrl, '_blank')}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Current
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ArtistDocuments;
