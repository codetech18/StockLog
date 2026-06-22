import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';

const PIN_HASH_KEY = 'stocklog_pin_hash';

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

type PinContextValue = {
  hasPin: boolean;
  isUnlocked: boolean;
  isReady: boolean;
  setPin: (pin: string) => Promise<void>;
  clearPin: () => Promise<void>;
  unlock: (pin: string) => Promise<boolean>;
};

const PinContext = createContext<PinContextValue | null>(null);

export function PinProvider({ children }: PropsWithChildren) {
  const [hash, setHash] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(PIN_HASH_KEY).then((stored) => {
      setHash(stored);
      setIsUnlocked(!stored);
      setIsReady(true);
    });
  }, []);

  // Re-lock whenever the app leaves the foreground — otherwise a PIN you can bypass
  // just by backgrounding the app instead of closing it isn't really a lock at all.
  // Resubscribing whenever `hash` changes (rare — only on set/clear) keeps the listener's
  // closure fresh without needing a ref to track the latest value.
  const hasPin = !!hash;
  useEffect(() => {
    if (!hasPin) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        setIsUnlocked(false);
      }
    });
    return () => subscription.remove();
  }, [hasPin]);

  const setPin = useCallback(async (pin: string) => {
    const next = await hashPin(pin);
    await SecureStore.setItemAsync(PIN_HASH_KEY, next);
    setHash(next);
    setIsUnlocked(true);
  }, []);

  const clearPin = useCallback(async () => {
    await SecureStore.deleteItemAsync(PIN_HASH_KEY);
    setHash(null);
    setIsUnlocked(true);
  }, []);

  const unlock = useCallback(
    async (pin: string) => {
      const candidate = await hashPin(pin);
      if (candidate === hash) {
        setIsUnlocked(true);
        return true;
      }
      return false;
    },
    [hash]
  );

  const value = useMemo<PinContextValue>(
    () => ({ hasPin: !!hash, isUnlocked, isReady, setPin, clearPin, unlock }),
    [hash, isUnlocked, isReady, setPin, clearPin, unlock]
  );

  return <PinContext.Provider value={value}>{children}</PinContext.Provider>;
}

export function usePin() {
  const ctx = useContext(PinContext);
  if (!ctx) throw new Error('usePin must be used within a PinProvider');
  return ctx;
}
