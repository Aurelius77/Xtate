import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { rateLimiter, validateEmail, validatePassword, sanitizeInput } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: 'admin' | 'resident' | 'security';
  houseUnit?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) return null;

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  const role = (roleData?.role as 'admin' | 'resident' | 'security') || 'resident';

  return {
    id: profile.id,
    email: profile.email,
    role,
    full_name: profile.full_name,
    phone: profile.phone || '',
    profile_image_url: profile.profile_image_url || undefined,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

export const SecureAuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) setUser(profile);
        }
      } catch (error) {
        console.error('Auth init failed:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (mounted) setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        if (mounted) setUser(null);
      }
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const cleanEmail = sanitizeInput(email.toLowerCase());

    if (!validateEmail(cleanEmail)) {
      throw new Error('Invalid email format');
    }
    if (password.length < 6) {
      throw new Error('Password too short');
    }

    const rateLimitKey = `login_${cleanEmail}`;
    if (!rateLimiter.isAllowed(rateLimitKey, 5, 15 * 60 * 1000)) {
      throw new Error('Too many login attempts. Please try again in 15 minutes.');
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw new Error(error.message);

      const profile = await fetchUserProfile(data.user.id);
      if (!profile) throw new Error('Profile not found');

      setUser(profile);
      rateLimiter.reset(rateLimitKey);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${profile.full_name}!`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    const cleanData = {
      fullName: sanitizeInput(userData.fullName),
      email: sanitizeInput(userData.email.toLowerCase()),
      phone: sanitizeInput(userData.phone),
      role: userData.role,
      houseUnit: userData.houseUnit ? sanitizeInput(userData.houseUnit) : undefined,
      password: userData.password,
    };

    if (!validateEmail(cleanData.email)) throw new Error('Invalid email format');
    const pwVal = validatePassword(cleanData.password);
    if (!pwVal.isValid) throw new Error(pwVal.errors[0]);
    if (cleanData.fullName.length < 2) throw new Error('Full name must be at least 2 characters');

    const rateLimitKey = `register_${cleanData.email}`;
    if (!rateLimiter.isAllowed(rateLimitKey, 3, 60 * 60 * 1000)) {
      throw new Error('Too many registration attempts. Please try again later.');
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: cleanData.email,
        password: cleanData.password,
        options: {
          data: {
            full_name: cleanData.fullName,
            phone: cleanData.phone,
            role: cleanData.role,
            house_unit: cleanData.houseUnit || '',
          },
        },
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Registration failed');

      rateLimiter.reset(rateLimitKey);

      // Fetch profile (created by trigger)
      const profile = await fetchUserProfile(data.user.id);
      if (profile) {
        setUser(profile);
      }

      toast({
        title: "Registration Successful",
        description: "Welcome to EstateConnect! Please check your email to verify your account.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast({ title: "Registration Failed", description: errorMessage, variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updateData: Partial<User>): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    const cleanData: Record<string, string> = {};
    if (updateData.full_name) cleanData.full_name = sanitizeInput(updateData.full_name);
    if (updateData.phone) cleanData.phone = sanitizeInput(updateData.phone);
    if (updateData.email) {
      const cleanEmail = sanitizeInput(updateData.email.toLowerCase());
      if (!validateEmail(cleanEmail)) throw new Error('Invalid email format');
      cleanData.email = cleanEmail;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(cleanData)
        .eq('id', user.id);

      if (error) throw new Error(error.message);

      const updatedUser = { ...user, ...cleanData, updated_at: new Date().toISOString() };
      setUser(updatedUser);

      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      toast({ title: "Update Failed", description: errorMessage, variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) setUser(profile);
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSupabaseConnected: true,
    login,
    register,
    logout,
    updateProfile,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
