import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import categoriesReducer from './categoriesSlice';
import eventsReducer from './eventsSlice';
import networkReducer from './networkSlice';
import ticketsReducer from './ticketsSlice';

export const store = configureStore({
    reducer: {
        // Global : utilisateur connecté (ressource user de Maxime), catégories, état du réseau
        auth: authReducer,
        categories: categoriesReducer,
        network: networkReducer,
        // Ressources individuelles : événements (Nolan), billets (Florian)
        events: eventsReducer,
        tickets: ticketsReducer,
    },
});
