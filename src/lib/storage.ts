import { Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

type SimpleStorage = {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
};

export const StorageKeys = {
  notificationsEnabled: 'notificationsEnabled',
} as const;

// react-native-mmkv's web fallback is backed by localStorage and throws if accessed
// outside a DOM (e.g. during the web SSR bundle render) — web isn't a target platform
// (PRD: Android + iOS only), so just use an in-memory stub there instead.
function createWebSafeStorage(): SimpleStorage {
  const memory = new Map<string, string>();
  return {
    getString: (key) => memory.get(key),
    set: (key, value) => {
      memory.set(key, value);
    },
  };
}

export const storage: SimpleStorage = Platform.OS === 'web' ? createWebSafeStorage() : createMMKV({ id: 'stocklog' });
