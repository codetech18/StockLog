import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { supabase } from '@/lib/supabase';
import type { Shop } from '@/lib/types';

type AuthContextValue = {
  session: Session | null;
  shop: Shop | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  createShop: (shopName: string, ownerName: string) => Promise<{ error: string | null }>;
  updateShop: (shopName: string, ownerName: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  // undefined = not yet fetched for the current session, null = fetched and no shop exists.
  const [shop, setShop] = useState<Shop | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsSessionLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setShop(null);
      return;
    }

    setShop(undefined);
    supabase
      .from('shops')
      .select('*')
      .maybeSingle()
      .then(({ data }) => setShop((data as Shop | null) ?? null));
  }, [session]);

  const isShopLoading = !!session && shop === undefined;
  const isLoading = isSessionLoading || isShopLoading;

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      shop: shop ?? null,
      isLoading,
      async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: error.message, needsEmailConfirmation: false };
        return { error: null, needsEmailConfirmation: !data.session };
      },
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      async signOut() {
        await supabase.auth.signOut();
      },
      async createShop(shopName, ownerName) {
        if (!session) return { error: 'You must be logged in.' };
        const { data, error } = await supabase
          .from('shops')
          .insert({ owner_id: session.user.id, shop_name: shopName, owner_name: ownerName || null })
          .select()
          .single();
        if (error) return { error: error.message };
        setShop(data as Shop);
        return { error: null };
      },
      async updateShop(shopName, ownerName) {
        if (!shop) return { error: 'Your shop isn’t set up yet.' };
        const { data, error } = await supabase
          .from('shops')
          .update({ shop_name: shopName, owner_name: ownerName || null })
          .eq('id', shop.id)
          .select()
          .single();
        if (error) return { error: error.message };
        setShop(data as Shop);
        return { error: null };
      },
    }),
    [session, shop, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
