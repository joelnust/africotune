import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { authAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Lock, User, Mail, Shield } from 'lucide-react';

const ArtistSettings: React.FC = () => {
  const [resetEmail, setResetEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);
  const { toast } = useToast();

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ title: 'Email required', variant: 'destructive' });
      return;
    }
    try {
      setSendingReset(true);
      await authAPI.requestPasswordReset(resetEmail);
      toast({ title: 'Reset link sent', description: 'Check your email for the link.' });
      setResetEmail('');
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to send reset email', variant: 'destructive' });
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and security settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Lock className="h-4 w-4" />
                  Reset Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Enter your account email to receive a reset link
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSendReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={sendingReset} className="w-full">
                    {sendingReset ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" className="w-full gap-2" disabled>
              <Mail className="h-4 w-4" />
              Update Email (Coming Soon)
            </Button>
            
            <Button variant="outline" className="w-full gap-2" disabled>
              <Shield className="h-4 w-4" />
              Security Settings (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ArtistSettings;

