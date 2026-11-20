import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { KeyValueStorage } from '@erui/core';

/** Preferences: AsyncStorage. */
export const nativeStorage: KeyValueStorage = {
  getItem: (k) => AsyncStorage.getItem(k),
  setItem: (k, v) => AsyncStorage.setItem(k, v),
  removeItem: (k) => AsyncStorage.removeItem(k),
};

/** Session tokens: Keychain (iOS) / Keystore-backed EncryptedSharedPreferences (Android). */
export const nativeSecureStorage: KeyValueStorage = {
  getItem: (k) => SecureStore.getItemAsync(k),
  setItem: (k, v) => SecureStore.setItemAsync(k, v),
  removeItem: (k) => SecureStore.deleteItemAsync(k),
};
