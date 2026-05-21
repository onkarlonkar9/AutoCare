import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserRole } from '@/types/user';
import { apiRequest } from '@/integrations/backend/client';
import type { AuthResponse, BackendUser } from '@/integrations/backend/types';

type AppRole = UserRole;
const AUTH_TOKEN_KEY = 'autocare_backend_token';

interface Session {
  access_token: string;
  user: BackendUser;
}

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface Subscription {
  plan_name: string;
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: BackendUser | null;
  profile: Profile | null;
  subscription: Subscription | null;
  role: AppRole | null;
  isAccessAllowed: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (name: string, email: string, password: string, role: AppRole) => Promise<{ error?: string }>;
  signInWithOtp: (email: string) => Promise<{ error?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isTrialExpired: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAppRole(value: unknown): AppRole | null {
  if (value === 'owner' || value === 'service_center' || value === 'admin') return value;
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const isAccessAllowed = true;

  const hydrateFromUser = useCallback((user: BackendUser, token: string) => {
    setSession({ access_token: token, user });
    setProfile({
      id: user.id,
      user_id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar_url: user.avatarUrl,
    });
    setRole(toAppRole(user.role));
    setSubscription({
      plan_name: user.planName,
      status: user.subscription,
      trial_ends_at: user.trialEndsAt,
      current_period_end: user.currentPeriodEnd,
    });
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest<{ user: BackendUser }>('/auth/me', undefined, token);
        hydrateFromUser(data.user, token);
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, [hydrateFromUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      hydrateFromUser(data.user, data.token);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Login failed' };
    }
  }, [hydrateFromUser]);

  const signup = useCallback(async (name: string, email: string, password: string, role: AppRole) => {
    try {
      const data = await apiRequest<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      hydrateFromUser(data.user, data.token);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Signup failed' };
    }
  }, [hydrateFromUser]);

  const signInWithOtp = useCallback(async (_email: string) => {
    return { error: 'OTP sign-in is not available on the new backend yet.' };
  }, []);

  const verifyOtp = useCallback(async (_email: string, _token: string) => {
    return { error: 'OTP verification is not available on the new backend yet.' };
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setSession(null);
    setProfile(null);
    setRole(null);
    setSubscription(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const data = await apiRequest<{ user: BackendUser }>('/auth/me', undefined, session.access_token);
      hydrateFromUser(data.user, session.access_token);
    } catch {
      await logout();
    }
  }, [session, hydrateFromUser, logout]);

  const isTrialExpired = useCallback(() => {
    if (!subscription) return false;
    if (subscription.status !== 'active' && subscription.plan_name === 'free_trial') return true;
    if (subscription.trial_ends_at) {
      return new Date(subscription.trial_ends_at) < new Date();
    }
    return false;
  }, [subscription]);

  return (
    <AuthContext.Provider value={{
      session, user: session?.user ?? null, profile, subscription, role,
      isAccessAllowed,
      isAuthenticated: !!session, loading,
      login, signup, signInWithOtp, verifyOtp, logout, refreshProfile, isTrialExpired
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
