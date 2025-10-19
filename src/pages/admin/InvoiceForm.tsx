import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { invoiceAPI } from '@/services/api';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InvoiceFormData {
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  contactPerson: string;
  invoiceDate: string;
  billingToCompanyName: string;
  billingToCompanyAddress: string;
  billingToCompanyPhone: string;
  billingToCompanyEmail: string;
  invoiceServiceType: string;
  totalUsed: number;
  unitPrice: number;
  totalAmount: number;
  totalNetAmount: number;
  accountNumber: number;
  bankName: string;
  branchName: string;
}

const InvoiceForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [form, setForm] = useState<InvoiceFormData>({
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    contactPerson: '',
    invoiceDate: '',
    billingToCompanyName: '',
    billingToCompanyAddress: '',
    billingToCompanyPhone: '',
    billingToCompanyEmail: '',
    invoiceServiceType: '',
    totalUsed: 0,
    unitPrice: 0,
    totalAmount: 0,
    totalNetAmount: 0,
    accountNumber: 0,
    bankName: '',
    branchName: '',
  });
  const [clientEmail, setClientEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [activeTab, setActiveTab] = useState('recipient');
  const { toast } = useToast();

  const update = (key: keyof InvoiceFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear any errors for this field when it's updated
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = (): string | null => {
    // Required fields with specific error messages
    const requiredFields = [
      { value: clientEmail.trim(), message: 'Client email is required' },
      { value: form.invoiceDate.trim(), message: 'Invoice date is required' },
      { value: form.billingToCompanyName.trim(), message: 'Billing company name is required' },
      { value: form.billingToCompanyEmail.trim(), message: 'Billing company email is required' },
      { value: form.invoiceServiceType.trim(), message: 'Service type is required' },
      { value: form.bankName.trim(), message: 'Bank name is required' }
    ];

    // Check each required field
    for (const field of requiredFields) {
      if (!field.value) return field.message;
    }

    // Numeric validations
    if (!form.totalUsed || form.totalUsed <= 0) return 'Total used must be greater than 0';
    if (!form.unitPrice || form.unitPrice <= 0) return 'Unit price must be greater than 0';
    if (!form.totalAmount || form.totalAmount <= 0) return 'Total amount must be greater than 0';
    if (form.totalNetAmount < 0) return 'Total net amount cannot be negative';
    if (!form.accountNumber || form.accountNumber <= 0) return 'Account number is required';
    
    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) return 'Invalid client email format';
    if (!emailRegex.test(form.billingToCompanyEmail)) return 'Invalid billing company email format';
    if (form.companyEmail && !emailRegex.test(form.companyEmail)) return 'Invalid company email format';
    
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrors({});
    
    const validationError = validateForm();
    if (validationError) {
      // Set the appropriate tab where the error is
      const errorField = validationError.toLowerCase();
      if (errorField.includes('email') || errorField.includes('billing') || errorField.includes('company name')) {
        setActiveTab('recipient');
      } else if (errorField.includes('date') || errorField.includes('service')) {
        setActiveTab('details');
      } else if (errorField.includes('total') || errorField.includes('amount') || errorField.includes('price') || errorField.includes('used')) {
        setActiveTab('amounts');
      } else if (errorField.includes('bank') || errorField.includes('account')) {
        setActiveTab('payment');
      }

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
        throw new Error('You must be logged in to send an invoice. Please log in and try again.');
      }

      await invoiceAPI.sendInvoice(form, clientEmail);
      
      setSuccessMessage(`Invoice sent successfully to ${clientEmail}`);
      toast({ 
        title: 'Success', 
        description: 'Invoice sent successfully',
        variant: 'default'
      });
      
      onSuccess?.();
      
      // Reset form
      setForm({
        companyAddress: '',
        companyPhone: '',
        companyEmail: '',
        contactPerson: '',
        invoiceDate: '',
        billingToCompanyName: '',
        billingToCompanyAddress: '',
        billingToCompanyPhone: '',
        billingToCompanyEmail: '',
        invoiceServiceType: '',
        totalUsed: 0,
        unitPrice: 0,
        totalAmount: 0,
        totalNetAmount: 0,
        accountNumber: 0,
        bankName: '',
        branchName: '',
      });
      setClientEmail('');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Failed to send invoice. Please check all fields and ensure you have the proper permissions.';
      
      let displayMessage = errorMessage;
      if (err?.response?.status === 403) {
        displayMessage = 'You do not have permission to send invoices. Contact your administrator.';
      } else if (err?.response?.status === 401) {
        displayMessage = 'Your session has expired. Please log in again.';
      }
      
      toast({ 
        title: 'Failed to Send Invoice', 
        description: displayMessage, 
        variant: 'destructive' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
            <div className="mt-2 text-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSuccessMessage('');
                  setForm({
                    companyAddress: '',
                    companyPhone: '',
                    companyEmail: '',
                    contactPerson: '',
                    invoiceDate: '',
                    billingToCompanyName: '',
                    billingToCompanyAddress: '',
                    billingToCompanyPhone: '',
                    billingToCompanyEmail: '',
                    invoiceServiceType: '',
                    totalUsed: 0,
                    unitPrice: 0,
                    totalAmount: 0,
                    totalNetAmount: 0,
                    accountNumber: 0,
                    bankName: '',
                    branchName: '',
                  });
                  setClientEmail('');
                  setActiveTab('recipient');
                }}
              >
                Create Another Invoice
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {submitting && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            Sending invoice...
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={onSubmit} className={submitting ? 'opacity-50 pointer-events-none' : ''}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-4">
            <TabsTrigger value="recipient">1. Recipient</TabsTrigger>
            <TabsTrigger value="details">2. Details</TabsTrigger>
            <TabsTrigger value="amounts">3. Amounts</TabsTrigger>
            <TabsTrigger value="payment">4. Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="recipient" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Send To (Email) *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingToCompanyName">Company Name *</Label>
                <Input
                  id="billingToCompanyName"
                  value={form.billingToCompanyName || ''}
                  onChange={(e) => update('billingToCompanyName', e.target.value)}
                  placeholder="Client company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingToCompanyEmail">Company Email *</Label>
                <Input
                  id="billingToCompanyEmail"
                  type="email"
                  value={form.billingToCompanyEmail || ''}
                  onChange={(e) => update('billingToCompanyEmail', e.target.value)}
                  placeholder="billing@client.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingToCompanyPhone">Phone</Label>
                  <Input
                    id="billingToCompanyPhone"
                    value={form.billingToCompanyPhone || ''}
                    onChange={(e) => update('billingToCompanyPhone', e.target.value)}
                    placeholder="+264..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingToCompanyAddress">Address</Label>
                  <Input
                    id="billingToCompanyAddress"
                    value={form.billingToCompanyAddress || ''}
                    onChange={(e) => update('billingToCompanyAddress', e.target.value)}
                    placeholder="Street address"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date *</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={form.invoiceDate || ''}
                  onChange={(e) => update('invoiceDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Input
                  id="serviceType"
                  value={form.invoiceServiceType || ''}
                  onChange={(e) => update('invoiceServiceType', e.target.value)}
                  placeholder="e.g., Music Licensing, Royalties"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Your Email</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Your Phone</Label>
                <Input
                  id="companyPhone"
                  value={form.companyPhone || ''}
                  onChange={(e) => update('companyPhone', e.target.value)}
                  placeholder="+264..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Your Address</Label>
                <Input
                  id="companyAddress"
                  value={form.companyAddress || ''}
                  onChange={(e) => update('companyAddress', e.target.value)}
                  placeholder="Street address"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="amounts" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalUsed">Quantity Used *</Label>
                <Input
                  id="totalUsed"
                  type="number"
                  step="0.01"
                  value={form.totalUsed || ''}
                  onChange={(e) => update('totalUsed', Number(e.target.value))}
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
                  value={form.unitPrice || ''}
                  onChange={(e) => update('unitPrice', Number(e.target.value))}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount (N$) *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={form.totalAmount || ''}
                  onChange={(e) => update('totalAmount', Number(e.target.value))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalNetAmount">Net Amount (N$)</Label>
                <Input
                  id="totalNetAmount"
                  type="number"
                  step="0.01"
                  value={form.totalNetAmount || ''}
                  onChange={(e) => update('totalNetAmount', Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  value={form.bankName || ''}
                  onChange={(e) => update('bankName', e.target.value)}
                  placeholder="e.g., First National Bank"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  type="number"
                  value={form.accountNumber || ''}
                  onChange={(e) => update('accountNumber', Number(e.target.value))}
                  placeholder="Account number"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name</Label>
              <Input
                id="branchName"
                value={form.branchName || ''}
                onChange={(e) => update('branchName', e.target.value)}
                placeholder="Branch name"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit Buttons - Fixed at bottom */}
        <div className="flex justify-between gap-3 pt-6 mt-6 border-t">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (activeTab !== 'recipient') {
                  setActiveTab(
                    activeTab === 'payment' ? 'amounts' :
                    activeTab === 'amounts' ? 'details' :
                    'recipient'
                  );
                }
              }}
              disabled={activeTab === 'recipient'}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (activeTab !== 'payment') {
                  setActiveTab(
                    activeTab === 'recipient' ? 'details' :
                    activeTab === 'details' ? 'amounts' :
                    'payment'
                  );
                }
              }}
              disabled={activeTab === 'payment'}
            >
              Next
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all fields?')) {
                  setForm({
                    companyAddress: '',
                    companyPhone: '',
                    companyEmail: '',
                    contactPerson: '',
                    invoiceDate: '',
                    billingToCompanyName: '',
                    billingToCompanyAddress: '',
                    billingToCompanyPhone: '',
                    billingToCompanyEmail: '',
                    invoiceServiceType: '',
                    totalUsed: 0,
                    unitPrice: 0,
                    totalAmount: 0,
                    totalNetAmount: 0,
                    accountNumber: 0,
                    bankName: '',
                    branchName: '',
                  });
                  setClientEmail('');
                  setActiveTab('recipient');
                }
              }}
            >
              Clear Form
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="bg-gradient-namsa hover:opacity-90"
            >
              {submitting ? 'Sending...' : 'Send Invoice'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
