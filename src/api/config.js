import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || '3001';
const API_PATH = process.env.EXPO_PUBLIC_API_PATH || '/api/v1';

function getDevHost() {
    const host = Constants.expoConfig?.hostUri?.split(':')[0];
    if (host && /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return host;
    return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

export const API_URL = `http://${API_HOST || getDevHost()}:${API_PORT}${API_PATH}`;

export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
