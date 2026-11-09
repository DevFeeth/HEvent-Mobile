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

export const getMyTickets = () => api.get('/users/me/tickets');

export const getMyOrders = () => api.get('/users/me/orders');

// Événements de l'organisateur connecté, brouillons compris
export const getMyEvents = () => api.get('/users/me/events');

export const updateMe = (data) => api.patch('/users/me', data);