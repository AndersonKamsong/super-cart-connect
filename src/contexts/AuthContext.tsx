import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse } from '@/types';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  socialLogin: (provider: 'google' | 'facebook') => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  isAuthenticated: boolean;
  isVerified: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  isCustomer: boolean;
  isDelivery: boolean;
}
interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  acceptTerms: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          console.log("profile",profile)
          setUser(profile.data);
        } catch (error) {
          localStorage.removeItem('auth_token');
          console.error('Auth initialization failed:', error);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Social login handler
  const socialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(true);
      // This would open a popup or redirect to the provider
      const response = await authService.socialLogin(provider);
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      toast({
        title: "Welcome!",
        description: `Logged in with ${provider}`,
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Social login failed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced register function
  const register = async (data: RegisterData) => {
    try {
      if (!data.acceptTerms) {
        throw new Error('You must accept the terms and conditions');
      }

      setLoading(true);
      const response: AuthResponse = await authService.register(data);
      localStorage.setItem('auth_token', response.token);
      setUser(response.data);
      
      toast({
        title: "Account Created!",
        description: response?.data?.user?.isVerified 
          ? "Welcome to our platform!" 
          : "Please check your email to verify your account",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Email verification functions
  const verifyEmail = async (token: string) => {
    try {
      setLoading(true);
      const verifiedUser = await authService.verifyEmail(token);
      setUser(verifiedUser);
      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify email",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      if (!user) throw new Error('No user logged in');
      setLoading(true);
      await authService.resendVerification(user.email);
      toast({
        title: "Verification Sent",
        description: "Check your email for the verification link",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response: AuthResponse = await authService.login(email, password);
      localStorage.setItem('auth_token', response?.data?.token);
      setUser(response?.data);
      console.log("response?.data",response?.data)
      toast({
        title: "Welcome back!",
        description:response?.data?.isVerified 
          ?  `Successfully logged in as ${response?.data?.name}` 
          : `Please ${response?.data?.name} check your email to verify your account`,
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isVendor: user?.role === 'vendor',
    isCustomer: user?.role === 'customer',
    isDelivery: user?.role === 'delivery',
    socialLogin,
    verifyEmail,
    resendVerification,
    isVerified: user?.isVerified || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};