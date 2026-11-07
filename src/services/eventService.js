import { api } from '../api/client';

// filters possibles : { status, category_name }
export const getEvents = (filters) => api.get('/events', { params: filters });

export const getEventById = (id) => api.get(`/events/${id}`);

// Organisateur (ou admin) uniquement
export const deleteEvent = (id) => api.delete(`/events/${id}`);
