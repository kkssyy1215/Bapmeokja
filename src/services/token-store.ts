import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'bapmeokja_access_token';
const REFRESH_TOKEN_KEY = 'bapmeokja_refresh_token';

let accessToken: string | null = null;
let refreshToken: string | null = null;

const usesSecureStorage = Platform.OS !== 'web';

async function getStoredToken(key: string) {
  return usesSecureStorage ? SecureStore.getItemAsync(key) : AsyncStorage.getItem(key);
}

async function setStoredToken(key: string, value: string) {
  if (usesSecureStorage) await SecureStore.setItemAsync(key, value);
  else await AsyncStorage.setItem(key, value);
}

async function removeStoredToken(key: string) {
  if (usesSecureStorage) await SecureStore.deleteItemAsync(key);
  await AsyncStorage.removeItem(key);
}

export const tokenStore = {
  async hydrate() {
    [accessToken, refreshToken] = await Promise.all([
      getStoredToken(ACCESS_TOKEN_KEY),
      getStoredToken(REFRESH_TOKEN_KEY),
    ]);
    return { accessToken, refreshToken };
  },

  getAccessToken() {
    return accessToken;
  },

  getRefreshToken() {
    return refreshToken;
  },

  async set(tokens: { accessToken: string; refreshToken: string }) {
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    await Promise.all([
      setStoredToken(ACCESS_TOKEN_KEY, accessToken),
      setStoredToken(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },

  async clear() {
    accessToken = null;
    refreshToken = null;
    await Promise.all([
      removeStoredToken(ACCESS_TOKEN_KEY),
      removeStoredToken(REFRESH_TOKEN_KEY),
    ]);
  },
};
