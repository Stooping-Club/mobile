import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { MOCK_USERS } from '@/constants/mock-data';
import { analytics } from '@/lib/analytics';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  requireAuth: (callback: () => void) => boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    initialized: false,
  });

  // Restore session on mount
  useEffect(() => {
    AsyncStorage.getItem('auth_user')
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw) as User;
          // Re-hydrate dates
          saved.joinedAt = new Date(saved.joinedAt);
          setState({ user: saved, loading: false, initialized: true });
        } else {
          setState((s) => ({ ...s, initialized: true }));
        }
      })
      .catch(() => setState((s) => ({ ...s, initialized: true })));
  }, []);

  const persistUser = useCallback(async (user: User | null) => {
    if (user) {
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem('auth_user');
    }
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    setState((s) => ({ ...s, loading: true }));
    await new Promise((r) => setTimeout(r, 900)); // Simulate network

    // Mock: find user by email or default to user1
    const found =
      MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? MOCK_USERS[0];

    await persistUser(found);
    setState({ user: found, loading: false, initialized: true });
    analytics.track('user_signed_in', { userId: found.id });
  }, [persistUser]);

  const signUp = useCallback(
    async (username: string, email: string, _password: string) => {
      setState((s) => ({ ...s, loading: true }));
      await new Promise((r) => setTimeout(r, 1100));

      const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        email,
        rating: 0,
        ratingCount: 0,
        itemsPosted: 0,
        itemsClaimed: 0,
        verified: false,
        verifiedEmail: email.endsWith('.edu'),
        trustScore: 40,
        joinedAt: new Date(),
        environmentalImpactLbs: 0,
      };

      await persistUser(newUser);
      setState({ user: newUser, loading: false, initialized: true });
      analytics.track('user_signed_up', { userId: newUser.id });
    },
    [persistUser]
  );

  const signOut = useCallback(async () => {
    await persistUser(null);
    setState({ user: null, loading: false, initialized: true });
  }, [persistUser]);

  const updateProfile = useCallback((data: Partial<User>) => {
    setState((s) => {
      if (!s.user) return s;
      const updated = { ...s.user, ...data };
      persistUser(updated);
      return { ...s, user: updated };
    });
  }, [persistUser]);

  // Returns true if user is authenticated, false if not (caller should show auth modal)
  const requireAuth = useCallback(
    (callback: () => void): boolean => {
      if (state.user) {
        callback();
        return true;
      }
      return false;
    },
    [state.user]
  );

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, signUp, signOut, updateProfile, requireAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
