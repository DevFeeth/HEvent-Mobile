import { api, setAuthToken } from '../api/client';

export async function login(email, password) {
    const { token } = await api.post('/users/login', { email, password });
    setAuthToken(token);
    return token;
}

export function logout() {
    setAuthToken(null);
}

export const register = (user) => api.post('/users', user);

export const getMe = () => api.get('/users/me');

export const getMyTickets = (signal) => api.get('/users/me/tickets', { signal });

export const getMyOrders = () => api.get('/users/me/orders');

// Événements de l'organisateur connecté, brouillons compris
export const getMyEvents = (signal) => api.get('/users/me/events', { signal });

export const updateMe = (data) => api.patch('/users/me', data);