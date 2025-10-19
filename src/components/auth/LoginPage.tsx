import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Music, Building2, Shield, Moon, Sun, Eye, EyeOff } from 'lucide-react';
import namsaLogo from '@/assets/namsa-logo.png';
import ForgotPasswordDialog from './ForgotPasswordDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registerMode, setRegisterMode] = useState(false);
  const [userType, setUserType] = useState<'artist' | 'company'>('artist');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  
  const { login, register, registerArtist, registerCompany } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if accessing admin route
  const isAdminLogin = location.pathname === '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      
      if (registerMode) {
        if (userType === 'artist') {
          await registerArtist({ email, password });
        } else {
          await registerCompany({ email, password });
        }
        setRegisterMode(false);
        setEmail('');
        setPassword('');
        // Show a prominent dialog informing user to check email
        setMessageTitle('Sign up complete');
        setMessageBody('Please check your email to verify your account.');
        setMessageDialogOpen(true);
      } else {
        await login({ email, password });
        
        // Redirect based on user role after successful login
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        switch (user.role) {
          case 'ARTIST':
            navigate('/artist');
            break;
          case 'COMPANY':
            navigate('/company');
            break;
          case 'ADMIN':
            navigate('/admin');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      // Detect wrong credentials
      const status = error?.response?.status;
      if (status === 401) {
        setMessageTitle('Wrong credentials');
        setMessageBody('Wrong password or username. Please try again.');
        setMessageDialogOpen(true);
      } else if (registerMode && status === 400) {
        setMessageTitle('Sign up failed');
        setMessageBody(error?.response?.data?.message || 'Failed to register.');
        setMessageDialogOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLicenseApplication = () => {
    navigate('/license-application');
  };

  if (isAdminLogin) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass animate-scale-in">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-32 h-16 relative">
              <img 
                src={namsaLogo} 
                alt="NAMSA Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-namsa bg-clip-text text-transparent">
                Admin Access
              </CardTitle>
              <CardDescription>
                Secure administrative portal
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all duration-200 focus:shadow-glow"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 transition-all duration-200 focus:shadow-glow"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-namsa hover:opacity-90 transition-all duration-200 hover-scale"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In as Admin'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header with Theme Toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="hover-scale"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Message Dialog for signup and login errors */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{messageTitle}</DialogTitle>
            <DialogDescription>{messageBody}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-60 h-25 relative">
            <img 
              src={namsaLogo} 
              alt="NAMSA Logo" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          
        </div>

        {/* Login Panels */}
        <div className="w-full max-w-3xl">
          <Tabs value={userType} onValueChange={(value) => setUserType(value as 'artist' | 'company')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-card border">
              <TabsTrigger value="artist" className="data-[state=active]:bg-gradient-namsa data-[state=active]:text-primary-foreground">
                <Music className="w-4 h-4 mr-2" />
                Member Portal
              </TabsTrigger>
              <TabsTrigger value="company" className="data-[state=active]:bg-gradient-namsa data-[state=active]:text-primary-foreground">
                <Building2 className="w-4 h-4 mr-2" />
                Music Users Portal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="artist" className="animate-fade-in">
              <Card className="glass hover-scale">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <Music className="w-6 h-6 text-primary" />
                    Member {registerMode ? 'Registration' : 'Login'}
                  </CardTitle>
                  <CardDescription>
                    {registerMode 
                      ? 'Create your artist account to start uploading music'
                      : 'Access your artist dashboard and manage your music'
                    }
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="artist-email">Email</Label>
                      <Input
                        id="artist-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="transition-all duration-200 focus:shadow-glow"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="artist-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="artist-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pr-10 transition-all duration-200 focus:shadow-glow"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-namsa hover:opacity-90 transition-all duration-200 hover-scale"
                      disabled={loading}
                    >
                      {loading ? 'Please wait...' : (registerMode ? 'Create membership Account' : 'Sign in as a Member')}
                    </Button>
                  </form>
                  
                  <Separator className="my-4" />
                  
                  <div className="text-center space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setRegisterMode(!registerMode);
                        setEmail('');
                        setPassword('');
                      }}
                      className="text-sm hover-scale"
                    >
                      {registerMode ? 'Already have an account? Sign in' : 'New Member? Create account'}
                    </Button>
                    <br />
                    <Button variant="link" className="text-sm text-muted-foreground">
                      <span onClick={() => setShowForgotPassword(true)} className="cursor-pointer hover:text-primary">
                        Forgot your password?
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="company" className="animate-fade-in">
              <Card className="glass hover-scale">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <Building2 className="w-6 h-6 text-primary" />
                    Music User Login
                  </CardTitle>
                  <CardDescription>
                    Access your  dashboard and music library
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Email</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="transition-all duration-200 focus:shadow-glow"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="company-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pr-10 transition-all duration-200 focus:shadow-glow"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-namsa hover:opacity-90 transition-all duration-200 hover-scale"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In as a Music User'}
                    </Button>
                  </form>
                  
                  <Separator className="my-4" />
                  
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Not a member yet?
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleLicenseApplication}
                      className="hover-scale border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Apply for License
                    </Button>
                    <br />
                    <Button variant="link" className="text-sm text-muted-foreground">
                      <span onClick={() => setShowForgotPassword(true)} className="cursor-pointer hover:text-primary">
                        Forgot your password?
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground animate-fade-in">
          <p>© 2025 NAMSA - Namibian Music System Administration</p>
          <p className="mt-1">Empowering Namibian music creators and industry professionals</p>
        </div>
      </div>
      
      <ForgotPasswordDialog 
        open={showForgotPassword} 
        onOpenChange={setShowForgotPassword} 
      />
    </div>
  );
};

export default LoginPage;
