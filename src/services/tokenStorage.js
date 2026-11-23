import * as SecureStore from 'expo-secure-store';

// Le token JWT reste dans le SecureStore (chiffré), pas dans Redux ni dans l'AsyncStorage
const TOKEN_KEY = 'hevent_token';

export const saveToken = (token) => SecureStore.setItemAsync(TOKEN_KEY, token);

export const loadToken = () => SecureStore.getItemAsync(TOKEN_KEY);

export const deleteToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);
