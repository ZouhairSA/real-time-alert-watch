import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";

// Types
type User = {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

// Mock user data for demonstration
const MOCK_USERS = [
  { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com', role: 'admin' as const },
  { id: 2, username: 'user1', password: 'user123', email: 'user1@example.com', role: 'user' as const },
  { id: 3, username: 'user2', password: 'user234', email: 'user2@example.com', role: 'user' as const }
];

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Mock login function
  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // This simulates an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = MOCK_USERS.find(
        u => u.username === username && u.password === password
      );
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Create a user object without the password
      const { password: _, ...safeUser } = user;
      
      // Create a mock JWT token (in a real app, this would come from the server)
      const mockToken = `mock-jwt-token-${Date.now()}`;
      
      localStorage.setItem('user', JSON.stringify(safeUser));
      localStorage.setItem('token', mockToken);
      
      setUser(safeUser);
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
