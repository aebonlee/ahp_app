import React, { useState, createContext, useContext } from 'react';

interface User {
  id?: string;
  username?: string;
  first_name: string;
  last_name: string;
  email: string;
  plan?: string;
  role?: 'super_admin' | 'admin' | 'manager' | 'evaluator' | 'user';
  is_superuser?: boolean;
  is_staff?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasRole: (role: string) => boolean;
  // AEBON EXCLUSIVE METHODS
  isAebon: boolean;
  hasAebonPrivilege: (privilege: string) => boolean;
  canManageUsers: boolean;
  canOverrideProjects: boolean;
  canAccessSystemSettings: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Super Admin users list - aebon has highest privileges
const SUPER_ADMIN_USERS = ['aebon', 'admin'];
const ADMIN_USERS = ['aebon', 'admin', 'manager'];

// AEBON EXCLUSIVE PRIVILEGES - Only aebon has these ultra-high permissions
const AEBON_EXCLUSIVE_PERMISSIONS = [
  'SYSTEM_ADMIN',           // System-wide administration
  'USER_MANAGEMENT',        // Complete user lifecycle management
  'ROLE_ASSIGNMENT',        // Assign any role to any user
  'PROJECT_OVERRIDE',       // Override any project settings
  'DATA_EXPORT_ALL',        // Export all system data
  'AUDIT_LOGS',            // View all audit logs
  'SYSTEM_SETTINGS',       // Modify system-wide settings
  'DATABASE_ACCESS',       // Direct database operations
  'BACKUP_RESTORE',        // System backup and restore
  'SUBSCRIPTION_MANAGEMENT', // Manage all subscriptions
  'BILLING_ACCESS',        // Access billing information
  'ANALYTICS_FULL'         // Full analytics access
];

// Helper functions for role checking
const checkIsSuperAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return Boolean(
    user.role === 'super_admin' || 
    user.is_superuser === true || 
    (user.username && SUPER_ADMIN_USERS.includes(user.username.toLowerCase()))
  );
};

const checkIsAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return Boolean(
    checkIsSuperAdmin(user) ||
    user.role === 'admin' || 
    user.is_staff === true || 
    (user.username && ADMIN_USERS.includes(user.username.toLowerCase()))
  );
};

const checkHasRole = (user: User | null, role: string): boolean => {
  if (!user) return false;
  if (checkIsSuperAdmin(user)) return true; // Super admin has all roles
  return user.role === role;
};

// AEBON EXCLUSIVE FUNCTIONS - Only aebon can access these
const checkIsAebon = (user: User | null): boolean => {
  if (!user) return false;
  return user.username?.toLowerCase() === 'aebon';
};

const checkHasAebonPrivilege = (user: User | null, privilege: string): boolean => {
  if (!checkIsAebon(user)) return false; // Only aebon can have exclusive privileges
  return AEBON_EXCLUSIVE_PERMISSIONS.includes(privilege);
};

const checkCanManageUsers = (user: User | null): boolean => {
  return checkIsAebon(user) || checkIsSuperAdmin(user);
};

const checkCanOverrideProjects = (user: User | null): boolean => {
  return checkIsAebon(user); // Only aebon can override any project
};

const checkCanAccessSystemSettings = (user: User | null): boolean => {
  return checkIsAebon(user); // Only aebon can modify system settings
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return default values if no context is provided
    const defaultUser = {
      id: '1',
      username: 'aebon',
      first_name: 'AHP',
      last_name: 'Super Admin',
      email: 'aebon@example.com',
      plan: 'Super Admin Plan 🔴',
      role: 'super_admin' as const,
      is_superuser: true,
      is_staff: true
    } as User;
    
    return {
      user: defaultUser,
      login: () => {},
      logout: () => {},
      isAuthenticated: true,
      isAdmin: checkIsAdmin(defaultUser),
      isSuperAdmin: checkIsSuperAdmin(defaultUser),
      hasRole: (role: string) => checkHasRole(defaultUser, role),
      // AEBON EXCLUSIVE METHODS
      isAebon: checkIsAebon(defaultUser),
      hasAebonPrivilege: (privilege: string) => checkHasAebonPrivilege(defaultUser, privilege),
      canManageUsers: checkCanManageUsers(defaultUser),
      canOverrideProjects: checkCanOverrideProjects(defaultUser),
      canAccessSystemSettings: checkCanAccessSystemSettings(defaultUser)
    };
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: '1',
    username: 'aebon',
    first_name: 'AHP',
    last_name: 'Super Admin',
    email: 'aebon@example.com',
    plan: 'Super Admin Plan 🔴',
    role: 'super_admin',
    is_superuser: true,
    is_staff: true
  });

  const login = (userData: User) => {
    // Enhance user data with role information if aebon
    const enhancedUser = {
      ...userData,
      role: userData.username?.toLowerCase() === 'aebon' ? 'super_admin' : userData.role || 'user',
      is_superuser: userData.username?.toLowerCase() === 'aebon' ? true : userData.is_superuser,
      is_staff: userData.username?.toLowerCase() === 'aebon' ? true : userData.is_staff
    };
    setUser(enhancedUser);
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = checkIsAdmin(user);
  const isSuperAdmin = checkIsSuperAdmin(user);
  const hasRole = (role: string) => checkHasRole(user, role);
  
  // AEBON EXCLUSIVE METHODS
  const isAebon = checkIsAebon(user);
  const hasAebonPrivilege = (privilege: string) => checkHasAebonPrivilege(user, privilege);
  const canManageUsers = checkCanManageUsers(user);
  const canOverrideProjects = checkCanOverrideProjects(user);
  const canAccessSystemSettings = checkCanAccessSystemSettings(user);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      isAdmin, 
      isSuperAdmin, 
      hasRole,
      // AEBON EXCLUSIVE METHODS
      isAebon,
      hasAebonPrivilege,
      canManageUsers,
      canOverrideProjects,
      canAccessSystemSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
};