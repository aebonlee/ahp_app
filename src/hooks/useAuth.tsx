import React, { useState, createContext, useContext } from 'react';

interface User {
  first_name: string;
  last_name: string;
  email: string;
  plan?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return default values if no context is provided
    return {
      user: {
        first_name: 'AHP',
        last_name: 'Tester',
        email: 'tester@example.com',
        plan: 'Pro Plan 🔵'
      } as User,
      login: () => {},
      logout: () => {},
      isAuthenticated: true
    };
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    first_name: 'AHP',
    last_name: 'Tester',
    email: 'tester@example.com',
    plan: 'Pro Plan 🔵'
  });

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};