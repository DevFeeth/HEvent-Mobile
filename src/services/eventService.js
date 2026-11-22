import { api } from '../api/client';

export const getEvents = (filters, signal) => api.get('/events', { params: filters, signal });

export const getUpcomingEvents = (signal) => api.get('/events/upcoming', { signal });

export const getEventById = (id) => api.get(`/events/${id}`);

export const createEvent = (event) => api.post('/events', event);

export const updateEvent = (id, changes) => api.patch(`/events/${id}`, changes);

export const deleteEvent = (id) => api.delete(`/events/${id}`);

