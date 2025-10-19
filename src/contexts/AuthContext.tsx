import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import { authAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  registerArtist: (data: RegisterRequest) => Promise<void>;
  registerCompany: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: 'ARTIST' | 'COMPANY' | 'ADMIN' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for auth events triggered by API (e.g. 401) across tabs/windows
  useEffect(() => {
    const handleAuthEvent = (e: any) => {
      // Storage event (other windows) or custom event in same window
      try {
        let payload: any = null;
        if (e?.key === 'namsa:auth') {
          payload = e.newValue ? JSON.parse(e.newValue) : null;
        } else {
          // Try read local item
          const raw = localStorage.getItem('namsa:auth');
          payload = raw ? JSON.parse(raw) : null;
        }
        if (payload?.type === 'logout') {
          // Ensure local state is cleared and user redirected
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast({ title: 'Session Ended', description: 'You have been logged out. Please sign in again.' });
          window.location.href = '/';
        }
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('storage', handleAuthEvent as any);
    window.addEventListener('namsa:auth', handleAuthEvent as any);
    return () => {
      window.removeEventListener('storage', handleAuthEvent as any);
      window.removeEventListener('namsa:auth', handleAuthEvent as any);
    };
  }, [toast]);

  const login = async (data: LoginRequest) => {
    try {
      setLoading(true);
      const response = await authAPI.login(data);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.email}!`,
      });
    } catch (error: any) {
      const raw = error?.response?.data;
      const message = (typeof raw === 'string' && raw.trim().length > 0)
        ? raw
        : (raw?.message || 'Login failed');
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      await authAPI.registerArtist(data);
      
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      const raw = error?.response?.data;
      const message = (typeof raw === 'string' && raw.trim().length > 0)
        ? raw
        : (raw?.message || 'Registration failed');
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerArtist = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      await authAPI.registerArtist(data);
      toast({ title: "Registration Successful", description: "Please check your email to verify your account." });
    } catch (error: any) {
      const raw = error?.response?.data;
      const message = (typeof raw === 'string' && raw.trim().length > 0) ? raw : (raw?.message || 'Registration failed');
      toast({ title: "Registration Failed", description: message, variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerCompany = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      await authAPI.registerCompany(data);
      toast({ title: "Registration Successful", description: "Company account created." });
    } catch (error: any) {
      const raw = error?.response?.data;
      const message = (typeof raw === 'string' && raw.trim().length > 0) ? raw : (raw?.message || 'Registration failed');
      toast({ title: "Registration Failed", description: message, variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    // Ensure redirect back to login
    window.location.href = '/';
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    registerArtist,
    registerCompany,
    logout,
    isAuthenticated: !!user,
    userRole: user?.role || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
