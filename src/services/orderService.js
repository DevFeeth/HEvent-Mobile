import { api } from '../api/client';

// items : [{ ticket_type_id, quantity }]
export const createOrder = (items, promoCode) =>
    api.post('/orders', { items, ...(promoCode && { promo_code: promoCode }) });

export const payOrder = (id, paymentMethod) => api.post(`/orders/${id}/pay`, { payment_method: paymentMethod });

export const cancelOrder = (id) => api.post(`/orders/${id}/cancel`);
