import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { dbService } from '../services/dbService';
import { logActivity } from '../services/mockDatabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check initial session
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Get user role from db
            const profile = await dbService.users.getByEmail(session.user.email);
            setUser(profile || {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || 'User',
              email: session.user.email,
              role: 'Staff Keuangan' // default fallback
            });
          }
        } else {
          // Load mock user from localStorage
          const savedUser = localStorage.getItem('elhakim_current_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (err) {
        console.error('Session verification failed');
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (data.user) {
          const profile = await dbService.users.getByEmail(data.user.email);
          const loggedInUser = profile || {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || 'User',
            email: data.user.email,
            role: 'Staff Keuangan'
          };
          setUser(loggedInUser);
          return { success: true, user: loggedInUser };
        }
      } else {
        // Mock Login
        const allUsers = await dbService.users.getAll();
        const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (found) {
          // Check password if it exists
          if (found.password && found.password !== password) {
            throw new Error('Password tidak sesuai');
          }
          
          setUser(found);
          localStorage.setItem('elhakim_current_user', JSON.stringify(found));
          logActivity(found.id, `User login: ${found.name} (${found.role})`);
          return { success: true, user: found };
        } else {
          throw new Error('Email tidak terdaftar pada sistem mockup');
        }
      }
    } catch (err) {
      return { success: false, error: err.message || 'Login gagal' };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler - CORRECTED
  const logout = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error('Supabase signout issue');
    } finally {
      if (user) {
        logActivity(user.id, `User logout: ${user.name}`);
      }
      setUser(null);
      localStorage.removeItem('elhakim_current_user');
      setLoading(false);
      // The hard refresh is removed. React's state and routing will handle the redirect.
    }
  };

  // Role Access Checks (RBAC)
  const isAdmin = () => user?.role === 'Admin Keuangan';
  const isStaff = () => user?.role === 'Staff Keuangan';
  const isMarketing = () => user?.role === 'Marketing';
  const isPimpinan = () => user?.role === 'Pimpinan';

  // Navigation or Route authorization
  const canAccessPath = (path) => {
    if (!user) return false;
    if (isAdmin()) return true; // Admin gets everything
    
    const cleanPath = path.toLowerCase();
    
    if (isStaff()) {
      const allowed = ['/dashboard', '/pengeluaran', '/kas-besar', '/laporan', '/laporan-harian', '/pengaturan', '/payments', '/invoice', '/receipt', '/grup'];
      if (cleanPath.includes('/pengaturan/users')) return false;
      return allowed.some(p => cleanPath.startsWith(p));
    }
    
    if (isMarketing()) {
      const allowed = ['/grup', '/jamaah'];
      return allowed.some(p => cleanPath.startsWith(p));
    }
    
    if (isPimpinan()) {
      const allowed = ['/dashboard', '/laporan', '/laporan-harian', '/audit-log', '/grup/detail', '/grup/daftar'];
      return allowed.some(p => cleanPath.startsWith(p));
    }
    
    return false;
  };

  const isReadOnly = () => {
    return isPimpinan();
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isStaff,
    isMarketing,
    isPimpinan,
    canAccessPath,
    isReadOnly
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
