import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin_app' | 'admin_firmy' | 'uzytkownik';

export interface AppUser extends Partial<User> {
  role: UserRole;
  full_name: string;
  organization_id?: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  signInLocal: (email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local Admin Credentials
const LOCAL_ADMIN = {
  email: 'effiresearch@gmail.com',
  password: '123456#',
  full_name: 'Damian Różycki',
  role: 'admin_app' as UserRole
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured] = useState(isSupabaseConfigured());

  useEffect(() => {
    // Check local storage for local session first
    const localUser = localStorage.getItem('ogrid_local_user');
    if (localUser) {
      setUser(JSON.parse(localUser));
      setLoading(false);
      return;
    }

    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // Map Supabase user to AppUser
        setUser({
          ...session.user,
          role: (session.user.user_metadata?.role as UserRole) || 'uzytkownik',
          full_name: session.user.user_metadata?.full_name || 'Użytkownik'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }).catch(err => {
      console.error('Auth check failed:', err);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          ...session.user,
          role: (session.user.user_metadata?.role as UserRole) || 'uzytkownik',
          full_name: session.user.user_metadata?.full_name || 'Użytkownik'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  const signInLocal = async (email: string, password: string): Promise<boolean> => {
    if (email === LOCAL_ADMIN.email && password === LOCAL_ADMIN.password) {
      const user: AppUser = {
        id: 'local-admin-id',
        email: LOCAL_ADMIN.email,
        full_name: LOCAL_ADMIN.full_name,
        role: LOCAL_ADMIN.role,
        user_metadata: { full_name: LOCAL_ADMIN.full_name, role: LOCAL_ADMIN.role }
      };
      setUser(user);
      localStorage.setItem('ogrid_local_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const signOut = async () => {
    localStorage.removeItem('ogrid_local_user');
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isConfigured, signOut, signInLocal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
