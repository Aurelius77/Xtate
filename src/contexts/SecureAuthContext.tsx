// Enhanced secure authentication context with encryption and rate limiting
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authAdapter, isSupabaseConnected } from '@/lib/supabase-adapter';
import { secureSession, rateLimiter, validateEmail, validatePassword, sanitizeInput } from '@/lib/security';
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

export const SecureAuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check for existing secure session
        const savedUser = secureSession.get('user');
        if (savedUser) {
          // Validate session hasn't been tampered with
          if (validateUser(savedUser)) {
            setUser(savedUser);
          } else {
            secureSession.clear();
          }
        }
        
        // If Supabase is connected, validate with server
        if (isSupabaseConnected() && savedUser) {
          try {
            const serverUser = await authAdapter.getCurrentUser();
            if (serverUser) {
              setUser(serverUser);
              secureSession.set('user', serverUser);
            } else {
              // Server session expired
              setUser(null);
              secureSession.clear();
            }
          } catch (error) {
            console.error('Server auth check failed:', error);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        secureSession.clear();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const validateUser = (userData: any): boolean => {
    return userData && 
           typeof userData.id === 'string' && 
           typeof userData.email === 'string' && 
           validateEmail(userData.email) &&
           ['admin', 'resident', 'security'].includes(userData.role);
  };

  const login = async (email: string, password: string): Promise<void> => {
    // Sanitize inputs
    const cleanEmail = sanitizeInput(email.toLowerCase());
    const cleanPassword = sanitizeInput(password);

    // Validate inputs
    if (!validateEmail(cleanEmail)) {
      throw new Error('Invalid email format');
    }

    if (cleanPassword.length < 6) {
      throw new Error('Password too short');
    }

    // Rate limiting
    const rateLimitKey = `login_${cleanEmail}`;
    if (!rateLimiter.isAllowed(rateLimitKey, 5, 15 * 60 * 1000)) {
      throw new Error('Too many login attempts. Please try again in 15 minutes.');
    }

    try {
      setIsLoading(true);
      
      const userData = await authAdapter.login(cleanEmail, cleanPassword);
      
      if (!validateUser(userData)) {
        throw new Error('Invalid user data received');
      }

      setUser(userData);
      secureSession.set('user', userData, 24); // 24 hour session
      rateLimiter.reset(rateLimitKey); // Reset rate limit on successful login

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.full_name}!`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    // Sanitize inputs
    const cleanData = {
      fullName: sanitizeInput(userData.fullName),
      email: sanitizeInput(userData.email.toLowerCase()),
      phone: sanitizeInput(userData.phone),
      role: userData.role,
      houseUnit: userData.houseUnit ? sanitizeInput(userData.houseUnit) : undefined,
      password: userData.password // Don't sanitize password as it might remove special chars
    };

    // Validate inputs
    if (!validateEmail(cleanData.email)) {
      throw new Error('Invalid email format');
    }

    const passwordValidation = validatePassword(cleanData.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors[0]);
    }

    if (cleanData.fullName.length < 2) {
      throw new Error('Full name must be at least 2 characters');
    }

    // Rate limiting for registration
    const rateLimitKey = `register_${cleanData.email}`;
    if (!rateLimiter.isAllowed(rateLimitKey, 3, 60 * 60 * 1000)) {
      throw new Error('Too many registration attempts. Please try again later.');
    }

    try {
      setIsLoading(true);
      
      const newUser = await authAdapter.register(cleanData);
      
      if (!validateUser(newUser)) {
        throw new Error('Invalid user data received');
      }

      if (newUser.role === 'resident') {
        setUser(newUser);
        secureSession.set('user', newUser, 24);
        
        toast({
          title: "Registration Successful",
          description: "Welcome to EstateConnect!",
        });
      } else {
        toast({
          title: "Registration Submitted",
          description: "Admin account requires approval. You'll receive an email once approved.",
        });
      }

      rateLimiter.reset(rateLimitKey); // Reset rate limit on successful registration

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call server logout if Supabase is connected
      if (isSupabaseConnected()) {
        await authAdapter.logout();
      }
      
      // Clear local session
      setUser(null);
      secureSession.clear();
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local session even if server logout fails
      setUser(null);
      secureSession.clear();
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updateData: Partial<User>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    // Sanitize update data
    const cleanData: Partial<User> = {};
    if (updateData.full_name) cleanData.full_name = sanitizeInput(updateData.full_name);
    if (updateData.phone) cleanData.phone = sanitizeInput(updateData.phone);
    if (updateData.email) {
      const cleanEmail = sanitizeInput(updateData.email.toLowerCase());
      if (!validateEmail(cleanEmail)) {
        throw new Error('Invalid email format');
      }
      cleanData.email = cleanEmail;
    }

    try {
      setIsLoading(true);
      
      const updatedUser = { 
        ...user, 
        ...cleanData, 
        updated_at: new Date().toISOString() 
      };
      
      if (!validateUser(updatedUser)) {
        throw new Error('Invalid user data');
      }

      setUser(updatedUser);
      secureSession.set('user', updatedUser, 24);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async (): Promise<void> => {
    if (isSupabaseConnected()) {
      try {
        const serverUser = await authAdapter.getCurrentUser();
        if (serverUser) {
          setUser(serverUser);
          secureSession.set('user', serverUser);
        }
      } catch (error) {
        console.error('Auth refresh failed:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSupabaseConnected: isSupabaseConnected(),
    login,
    register,
    logout,
    updateProfile,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};