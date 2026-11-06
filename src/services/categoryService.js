import { api } from '../api/client';

export const getCategories = () => api.get('/categories');
