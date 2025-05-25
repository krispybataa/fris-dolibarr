import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { authAPI } from '../services/api';

interface User {
  userId: number;
  userName: string;
  userEmail: string;
  role: string;
  college: string;
  department: string;
  isDepartmentHead: boolean;
  isDean: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
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
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);

  // Setup axios defaults when token changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }
      
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching user profile with token:', token.substring(0, 10) + '...');
        const data = await authAPI.getProfile();
        setUser(data.user);
        localStorage.setItem('userId', data.user.userId.toString());
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        
        // Clear token on authentication errors
        if (error.response?.status === 401) {
          console.log('Unauthorized error, clearing token');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log(`Attempting to login with email: ${email}`);
      
      // Clear any existing token first
      localStorage.removeItem('token');
      setToken(null);
      
      // Development mode - use simple tokens for testing
      if (email.includes('dev_')) {
        console.log('Using development token mode');
        const devToken = email; // Use the email as the token (e.g., dev_admin)
        localStorage.setItem('token', devToken);
        setToken(devToken);
        
        // Fetch profile with dev token
        try {
          const data = await authAPI.getProfile();
          setUser(data.user);
          
          // Store user ID in localStorage for API calls
          if (data.user && data.user.userId) {
            localStorage.setItem('userId', data.user.userId.toString());
            console.log('Stored user ID in localStorage:', data.user.userId);
          }
          
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error fetching profile with dev token:', error);
          // Continue with normal login if dev token fails
        }
      }
      
      // Attempt to login with real credentials
      const authData = await authAPI.login(email, password);
      const { access_token } = authData;
      
      if (!access_token) {
        throw new Error('No access token received from server');
      }
      
      console.log(`Login successful, token received: ${access_token.substring(0, 10)}...`);
      
      // Store token in localStorage and state
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      // Wait a moment for the token to be properly set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // Get user profile with the new token
        const profileData = await authAPI.getProfile();
        setUser(profileData.user);
        
        // Store user ID in localStorage for API calls
        if (profileData.user && profileData.user.userId) {
          localStorage.setItem('userId', profileData.user.userId.toString());
          console.log('Stored user ID in localStorage:', profileData.user.userId);
        }
        
        console.log('Profile fetched successfully:', profileData.user);
      } catch (profileError) {
        console.error('Error fetching profile after login:', profileError);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
