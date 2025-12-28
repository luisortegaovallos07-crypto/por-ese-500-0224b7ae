import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, mockUsers, UserRole } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isProfesor: boolean;
  isEstudiante: boolean;
  canManageUsers: boolean;
  canManageContent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'porese500_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Verify user still exists and is active
        const validUser = mockUsers.find(u => u.id === parsedUser.id && u.activo);
        if (validUser) {
          setUser(validUser);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      return { success: false, error: 'Credenciales inválidas. Verifica tu correo y contraseña.' };
    }

    if (!foundUser.activo) {
      return { success: false, error: 'Tu cuenta está desactivada. Contacta al administrador.' };
    }

    setUser(foundUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isAdmin = user?.role === 'admin';
  const isProfesor = user?.role === 'profesor';
  const isEstudiante = user?.role === 'estudiante';
  const canManageUsers = isAdmin || isProfesor;
  const canManageContent = isAdmin || isProfesor;

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin,
    isProfesor,
    isEstudiante,
    canManageUsers,
    canManageContent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to check if user has specific role(s)
export const hasRole = (user: User | null, roles: UserRole | UserRole[]): boolean => {
  if (!user) return false;
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
};
