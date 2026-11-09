import { api } from '../api/client';

// Organisateur (ou admin) : valide un billet à l'entrée → il passe en USED
export const scanTicket = (qrToken) => api.post('/tickets/scan', { qr_token: qrToken });
