import { api } from '../api/client';

export const scanTicket = (qrToken) => api.post('/tickets/scan', { qr_token: qrToken });

export const getEventTickets = (eventId, filters) => api.get(`/events/${eventId}/tickets`, { params: filters });

export const getTicketQrToken = (ticketId) => api.get(`/tickets/${ticketId}/qr-token`);
