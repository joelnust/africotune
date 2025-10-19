import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Building2, User, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { licenseAPI, lookupAPI } from '@/services/api';
import { Title, MusicUsageTypes, SourceOfMusic, LicenseApplicationForm } from '@/types';
import namsaLogo from '@/assets/namsa-logo.png';

const LicenseApplicationPage: React.FC = () => {
  const [applicationType, setApplicationType] = useState<'legal' | 'natural'>('legal');
  const [formData, setFormData] = useState<LicenseApplicationForm>({
    applicationType: 'legal',
    vatStatusId: undefined,
  } as any);
  const [loading, setLoading] = useState(false);
  const [titles, setTitles] = useState<Title[]>([]);
  const [musicUsageTypes, setMusicUsageTypes] = useState<MusicUsageTypes[]>([]);
  const [sourceOfMusic, setSourceOfMusic] = useState<SourceOfMusic[]>([]);
  const [vatStatuses, setVatStatuses] = useState<{ id: number; statusName: string }[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadLookupData = async () => {
      try {
        const [titlesData, usageTypesData, sourceData, vatData] = await Promise.all([
          lookupAPI.getTitles().catch(() => []),
          lookupAPI.getMusicUsageTypes().catch(() => []),
          lookupAPI.getSourceOfMusic().catch(() => []),
          lookupAPI.getVatStatuses().catch(() => []),
        ]);
        setTitles(titlesData as any);
        setMusicUsageTypes(usageTypesData as any);
        setSourceOfMusic(sourceData as any);
        setVatStatuses(vatData as any);
      } catch (error) {
        console.error('Failed to load lookup data:', error);
        toast({
          title: "Error",
          description: "Failed to load form data. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadLookupData();
  }, [toast]);

  const handleInputChange = (field: keyof LicenseApplicationForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (applicationType === 'legal') {
        await licenseAPI.createLegalEntity({
          companyName: formData.companyName,
          companyShortName: formData.companyShortName,
          registrationNumber: formData.registrationNumber,
          vatStatus: (formData as any).vatStatusId ? { id: (formData as any).vatStatusId } : undefined,
          vatNumber: formData.vatNumber,
          ownerFirstName: formData.ownerFirstName,
          ownerLastName: formData.ownerLastName,
          ownerEmail: formData.ownerEmail,
          ownerPhone: formData.ownerPhone,
          ownerTitle: formData.ownerTitleId ? { id: formData.ownerTitleId } as Title : undefined,
          numberOfPremises: formData.numberOfPremises || 0,
          buildingName: formData.buildingName,
          unitNoOrShop: formData.unitNoOrShop,
          street: formData.street,
          suburb: formData.suburb,
          cityOrTown: formData.cityOrTown,
          country: formData.country,
          postalCode: formData.postalCode,
          musicUsageType: formData.musicUsageTypeId ? { id: formData.musicUsageTypeId } as MusicUsageTypes : undefined,
          sourceOfMusic: formData.sourceOfMusicId ? { id: formData.sourceOfMusicId } as SourceOfMusic : undefined,
        });
      } else {
        await licenseAPI.createNaturalPerson({
          surname: formData.surname,
          firstName: formData.firstName,
          idNumber: formData.idNumber,
          title: formData.titleId ? { id: formData.titleId } as Title : undefined,
          businessRoleOrTitle: formData.businessRoleOrTitle,
          email: formData.email,
          phone: formData.phone,
          fax: formData.fax,
          addressLocation: formData.addressLocation,
          unitNo: formData.unitNo,
          cityOrTown: formData.cityOrTown,
          suburb: formData.suburb,
          province: formData.province,
          country: formData.country,
          postalCode: formData.postalCode,
          street: formData.street,
          numberOfPremises: formData.numberOfPremises || 0,
          commencementDate: formData.commencementDate,
          tradingNameOfBusiness: formData.tradingNameOfBusiness,
          musicUsageType: formData.musicUsageTypeId ? { id: formData.musicUsageTypeId } as MusicUsageTypes : undefined,
          sourceOfMusic: formData.sourceOfMusicId ? { id: formData.sourceOfMusicId } as SourceOfMusic : undefined,
        });
      }

      toast({
        title: "Application Submitted",
        description: "Your license application has been submitted successfully. You will be contacted by our team.",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="hover-scale"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
          
          <div className="flex items-center space-x-4">
            <img 
              src={namsaLogo} 
              alt="NAMSA Logo" 
              className="h-20 object-contain"
            />
          </div>
        </div>

        {/* Main Content */}
        <Card className="glass animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl bg-gradient-namsa bg-clip-text text-transparent">
              License Application
            </CardTitle>
            <CardDescription className="text-lg">
              Apply for a music usage license with NAMSA
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={applicationType} onValueChange={(value) => {
              setApplicationType(value as 'legal' | 'natural');
              setFormData({ applicationType: value as 'legal' | 'natural' });
            }}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="legal" className="data-[state=active]:bg-gradient-namsa data-[state=active]:text-primary-foreground">
                  <Building2 className="w-4 h-4 mr-2" />
                  Legal Entity
                </TabsTrigger>
                <TabsTrigger value="natural" className="data-[state=active]:bg-gradient-namsa data-[state=active]:text-primary-foreground">
                  <User className="w-4 h-4 mr-2" />
                  Natural Person
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6">
                <TabsContent value="legal" className="space-y-6">
                  {/* Legal Entity Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName || ''}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyShortName">Company Short Name</Label>
                      <Input
                        id="companyShortName"
                        value={formData.companyShortName || ''}
                        onChange={(e) => handleInputChange('companyShortName', e.target.value)}
                        placeholder="e.g., NBC"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number *</Label>
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber || ''}
                        onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vatStatus">VAT Status</Label>
                      {vatStatuses.length > 0 ? (
                        <Select value={String((formData as any).vatStatusId || '')} onValueChange={(value) => setFormData(prev => ({ ...prev, vatStatusId: value ? parseInt(value) : undefined }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select VAT status" />
                          </SelectTrigger>
                          <SelectContent>
                            {vatStatuses.map((v) => (
                              <SelectItem key={v.id} value={v.id.toString()}>
                                {v.statusName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-xs text-muted-foreground">No VAT status options available</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vatNumber">VAT Number</Label>
                      <Input
                        id="vatNumber"
                        value={formData.vatNumber || ''}
                        onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Owner Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="ownerTitle">Title</Label>
                        <Select value={formData.ownerTitleId?.toString() || ''} onValueChange={(value) => handleInputChange('ownerTitleId', parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select title" />
                          </SelectTrigger>
                          <SelectContent>
                            {titles.map((title) => (
                              <SelectItem key={title.id} value={title.id.toString()}>
                                {title.titleName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ownerFirstName">First Name *</Label>
                        <Input
                          id="ownerFirstName"
                          value={formData.ownerFirstName || ''}
                          onChange={(e) => handleInputChange('ownerFirstName', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ownerLastName">Last Name *</Label>
                        <Input
                          id="ownerLastName"
                          value={formData.ownerLastName || ''}
                          onChange={(e) => handleInputChange('ownerLastName', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ownerEmail">Email *</Label>
                        <Input
                          id="ownerEmail"
                          type="email"
                          value={formData.ownerEmail || ''}
                          onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ownerPhone">Phone *</Label>
                        <Input
                          id="ownerPhone"
                          value={formData.ownerPhone || ''}
                          onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="natural" className="space-y-6">
                  {/* Natural Person Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Select value={formData.titleId?.toString() || ''} onValueChange={(value) => handleInputChange('titleId', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                        <SelectContent>
                          {titles.map((title) => (
                            <SelectItem key={title.id} value={title.id.toString()}>
                              {title.titleName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="surname">Surname *</Label>
                      <Input
                        id="surname"
                        value={formData.surname || ''}
                        onChange={(e) => handleInputChange('surname', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="idNumber">ID Number *</Label>
                      <Input
                        id="idNumber"
                        type="number"
                        value={formData.idNumber || ''}
                        onChange={(e) => handleInputChange('idNumber', parseInt(e.target.value))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessRole">Business Role/Title</Label>
                      <Input
                        id="businessRole"
                        value={formData.businessRoleOrTitle || ''}
                        onChange={(e) => handleInputChange('businessRoleOrTitle', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fax">Fax</Label>
                      <Input
                        id="fax"
                        value={formData.fax || ''}
                        onChange={(e) => handleInputChange('fax', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tradingName">Trading Name of Business</Label>
                      <Input
                        id="tradingName"
                        value={formData.tradingNameOfBusiness || ''}
                        onChange={(e) => handleInputChange('tradingNameOfBusiness', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="commencementDate">Commencement Date</Label>
                      <Input
                        id="commencementDate"
                        type="date"
                        value={formData.commencementDate || ''}
                        onChange={(e) => handleInputChange('commencementDate', e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Common Address Section */}
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={formData.street || ''}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cityOrTown">City/Town *</Label>
                      <Input
                        id="cityOrTown"
                        value={formData.cityOrTown || ''}
                        onChange={(e) => handleInputChange('cityOrTown', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="suburb">Suburb</Label>
                      <Input
                        id="suburb"
                        value={formData.suburb || ''}
                        onChange={(e) => handleInputChange('suburb', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={formData.country || ''}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode || ''}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numberOfPremises">Number of Premises</Label>
                      <Input
                        id="numberOfPremises"
                        type="number"
                        value={formData.numberOfPremises || ''}
                        onChange={(e) => handleInputChange('numberOfPremises', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Music Usage Information */}
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">Music Usage Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="musicUsageType">Music Usage Type</Label>
                      {musicUsageTypes.length > 0 ? (
                        <Select value={formData.musicUsageTypeId?.toString() || ''} onValueChange={(value) => handleInputChange('musicUsageTypeId', parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select usage type" />
                          </SelectTrigger>
                          <SelectContent>
                            {musicUsageTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                {type.usageType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-xs text-muted-foreground">No music usage types available</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sourceOfMusic">Source of Music</Label>
                      {sourceOfMusic.length > 0 ? (
                        <Select value={formData.sourceOfMusicId?.toString() || ''} onValueChange={(value) => handleInputChange('sourceOfMusicId', parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            {sourceOfMusic.map((source) => (
                              <SelectItem key={source.id} value={source.id.toString()}>
                                {source.sourceOfMusic}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-xs text-muted-foreground">No source of music options available</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="hover-scale"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-namsa hover:opacity-90 hover-scale"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LicenseApplicationPage;
