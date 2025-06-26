
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuth = async () => {
      try {
        // In a real app, this would check for existing session/token
        const savedUser = localStorage.getItem('estateconnect_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call - in real app, this would call Supabase auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - in real app, this would come from the API
      let mockUser: User;
      
      // Check if it's a security login
      if (email.includes('security') || email === 'john.security@estate.com' || email === 'mary.guard@estate.com') {
        mockUser = {
          id: '1',
          email,
          role: 'security',
          full_name: email.includes('john') ? 'John Security' : email.includes('mary') ? 'Mary Guard' : 'Security Personnel',
          phone: '+234-800-000-0000',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else {
        mockUser = {
          id: '1',
          email,
          role: email.includes('admin') ? 'admin' : 'resident',
          full_name: email.includes('admin') ? 'Estate Administrator' : 'John Resident',
          phone: '+234-800-000-0000',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      setUser(mockUser);
      localStorage.setItem('estateconnect_user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        role: userData.role,
        full_name: userData.fullName,
        phone: userData.phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (userData.role === 'resident') {
        // Auto-login residents
        setUser(newUser);
        localStorage.setItem('estateconnect_user', JSON.stringify(newUser));
      }
      // Admin accounts need approval, so don't auto-login
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('estateconnect_user');
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    const updatedUser = { ...user, ...userData, updated_at: new Date().toISOString() };
    setUser(updatedUser);
    localStorage.setItem('estateconnect_user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
