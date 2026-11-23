import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import calendarReducer from './calendarSlice';
import categoriesReducer from './categoriesSlice';
import eventsReducer from './eventsSlice';
import networkReducer from './networkSlice';
import ticketsReducer from './ticketsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        calendar: calendarReducer,
        categories: categoriesReducer,
        network: networkReducer,
        events: eventsReducer,
        tickets: ticketsReducer,
    },
});
