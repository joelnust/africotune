import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { invoiceAPI } from '@/services/api';
import { CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ArtistPaymentFormData {
  // Member Details
  artistName: string;
  artistId: string;
  artistEmail: string;
  artistPhoneNumber?: string;
  description?: string;
  paymentDate?: string;

  // Company Details
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  contactPerson?: string;

  // Payment Details
  totalplayed: number;
  UnitPrice: number;
  TotalEarned: number;
  TotalNetpaid: number;

  // Bank Details
  BankName: string;
  AccountNumber: string;
  branchName?: string;
}

interface Props {
  onSuccess?: () => void;
}

const ArtistPaymentFormContent: React.FC<Props> = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState('member');
  const [form, setForm] = useState<Partial<ArtistPaymentFormData>>({});
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { toast } = useToast();

  const update = (key: keyof ArtistPaymentFormData, value: any) => 
    setForm((prev) => ({ ...prev, [key]: value }));

  const validateForm = (): string | null => {
    // Member Details
    if (!recipientEmail.trim()) return 'Recipient email is required';
    if (!form.artistName?.trim()) return 'Member name is required';
    if (!form.artistId?.trim()) return 'Member ID is required';
    if (!form.artistEmail?.trim()) return 'Member email is required';

    // Payment Details
    if (!Number(form.totalplayed) || Number(form.totalplayed) < 0) return 'Total played must be a valid number';
    if (!Number(form.UnitPrice) || Number(form.UnitPrice) < 0) return 'Unit price must be a valid number';
    if (!Number(form.TotalEarned) || Number(form.TotalEarned) < 0) return 'Total earned must be a valid number';
    if (!Number(form.TotalNetpaid) || Number(form.TotalNetpaid) < 0) return 'Total net paid must be a valid number';

    // Bank Details
    if (!form.BankName?.trim()) return 'Bank name is required';
    if (!form.AccountNumber?.trim()) return 'Account number is required';

    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    const validationError = validateForm();
    if (validationError) {
      toast({ 
        title: 'Validation Error', 
        description: validationError, 
        variant: 'destructive' 
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to send a payment report. Please log in and try again.');
      }

      await invoiceAPI.sendArtistPayment(form, recipientEmail);
      
      setSuccessMessage(`Payment report sent successfully to ${recipientEmail}`);
      toast({ 
        title: 'Success', 
        description: 'Member payment report sent successfully',
        variant: 'default'
      });
      
      // Reset form
      setForm({});
      setRecipientEmail('');
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Failed to send payment report. Please check all fields and ensure you have the proper permissions.';
      
      let displayMessage = errorMessage;
      if (err?.response?.status === 403) {
        displayMessage = 'You do not have permission to send payment reports. Contact your administrator.';
      } else if (err?.response?.status === 401) {
        displayMessage = 'Your session has expired. Please log in again.';
      }
      
      toast({ 
        title: 'Failed to Send Payment Report', 
        description: displayMessage, 
        variant: 'destructive' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Send Member Payment Report</CardTitle>
          <CardDescription>
            Create and send a payment report to a member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="member">Member</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="bank">Bank</TabsTrigger>
            </TabsList>

            <TabsContent value="member" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Send To Email *</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="member@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artistName">Member Name *</Label>
                  <Input
                    id="artistName"
                    value={form.artistName || ''}
                    onChange={(e) => update('artistName', e.target.value)}
                    placeholder="Full member name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artistId">Member ID *</Label>
                  <Input
                    id="artistId"
                    value={form.artistId || ''}
                    onChange={(e) => update('artistId', e.target.value)}
                    placeholder="Member ID"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artistEmail">Member Email *</Label>
                  <Input
                    id="artistEmail"
                    type="email"
                    value={form.artistEmail || ''}
                    onChange={(e) => update('artistEmail', e.target.value)}
                    placeholder="member@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artistPhone">Member Phone</Label>
                  <Input
                    id="artistPhone"
                    value={form.artistPhoneNumber || ''}
                    onChange={(e) => update('artistPhoneNumber', e.target.value)}
                    placeholder="+264..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={form.paymentDate || ''}
                    onChange={(e) => update('paymentDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={form.description || ''}
                    onChange={(e) => update('description', e.target.value)}
                    placeholder="Payment description or notes"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="company" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Input
                    id="companyAddress"
                    value={form.companyAddress || ''}
                    onChange={(e) => update('companyAddress', e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={form.companyPhone || ''}
                    onChange={(e) => update('companyPhone', e.target.value)}
                    placeholder="+264..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={form.companyEmail || ''}
                    onChange={(e) => update('companyEmail', e.target.value)}
                    placeholder="info@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={form.contactPerson || ''}
                    onChange={(e) => update('contactPerson', e.target.value)}
                    placeholder="Full name"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalplayed">Total Selections (Plays) *</Label>
                  <Input
                    id="totalplayed"
                    type="number"
                    step="0.01"
                    value={form.totalplayed || ''}
                    onChange={(e) => update('totalplayed', Number(e.target.value))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price (N$) *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={form.UnitPrice || ''}
                    onChange={(e) => update('UnitPrice', Number(e.target.value))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalEarned">Total Earned (N$) *</Label>
                  <Input
                    id="totalEarned"
                    type="number"
                    step="0.01"
                    value={form.TotalEarned || ''}
                    onChange={(e) => update('TotalEarned', Number(e.target.value))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalNetpaid">Total Net Paid (N$) *</Label>
                  <Input
                    id="totalNetpaid"
                    type="number"
                    step="0.01"
                    value={form.TotalNetpaid || ''}
                    onChange={(e) => update('TotalNetpaid', Number(e.target.value))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={form.BankName || ''}
                    onChange={(e) => update('BankName', e.target.value)}
                    placeholder="e.g., First National Bank"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    value={form.AccountNumber || ''}
                    onChange={(e) => update('AccountNumber', e.target.value)}
                    placeholder="Account number"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="branchName">Branch Name</Label>
                  <Input
                    id="branchName"
                    value={form.branchName || ''}
                    onChange={(e) => update('branchName', e.target.value)}
                    placeholder="Branch name"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setForm({});
                setRecipientEmail('');
              }}
            >
              Clear Form
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="bg-gradient-namsa hover:opacity-90"
            >
              {submitting ? 'Sending Payment Report...' : 'Send Payment Report'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ArtistPaymentFormContent;