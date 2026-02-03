'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserTier = 'guest' | 'pro' | 'inner-circle';

interface User {
  email: string;
  tier: UserTier;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  tier: UserTier;
  isLoggedIn: boolean;
  isPro: boolean;
  isInnerCircle: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  applyPromo: (code: string) => { valid: boolean; discount: number; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Valid promo codes
const PROMO_CODES: Record<string, { discount: number; message: string }> = {
  'LAUNCH25': { discount: 25, message: '25% off your first 3 months!' },
  'AGENTAI25': { discount: 25, message: '25% off — welcome to the future of real estate!' },
  'DUSTINFOX': { discount: 25, message: '25% off — referred by Dustin Fox!' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check localStorage for saved session
    const saved = localStorage.getItem('aab_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo login — in production this hits an API
    // For now, any email/password combo works for demo
    const newUser: User = { 
      email, 
      tier: 'pro', // Default to pro for demo
      name: email.split('@')[0],
    };
    setUser(newUser);
    localStorage.setItem('aab_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aab_user');
  };

  const applyPromo = (code: string) => {
    const upper = code.toUpperCase().trim();
    const promo = PROMO_CODES[upper];
    if (promo) {
      return { valid: true, discount: promo.discount, message: promo.message };
    }
    return { valid: false, discount: 0, message: 'Invalid promo code' };
  };

  const tier = user?.tier || 'guest';

  return (
    <AuthContext.Provider value={{
      user,
      tier,
      isLoggedIn: !!user,
      isPro: tier === 'pro' || tier === 'inner-circle',
      isInnerCircle: tier === 'inner-circle',
      login,
      logout,
      applyPromo,
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
