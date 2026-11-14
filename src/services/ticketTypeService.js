import { api } from '../api/client';

export const getTicketTypesByEvent = (eventId) => api.get(`/events/${eventId}/ticket-types`);

export const addTicketType = (eventId, ticketType) => api.post(`/events/${eventId}/ticket-types`, ticketType);

export const updateTicketType = (id, changes) => api.patch(`/ticket-types/${id}`, changes);

export const deleteTicketType = (id) => api.delete(`/ticket-types/${id}`);
