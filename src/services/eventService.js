import { api } from '../api/client';

export const getEvents = (filters) => api.get('/events', { params: filters });

export const getUpcomingEvents = () => api.get('/events/upcoming');

export const getEventById = (id) => api.get(`/events/${id}`);

export const createEvent = (event) => api.post('/events', event);

export const updateEvent = (id, changes) => api.patch(`/events/${id}`, changes);

export const deleteEvent = (id) => api.delete(`/events/${id}`);
