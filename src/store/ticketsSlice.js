import { createSlice } from '@reduxjs/toolkit';

import { clearUser } from './authSlice';

// mine : billets de l'utilisateur connecté (null : pas encore chargés)
// typesByEvent : types de billets rangés par id d'événement
const ticketsSlice = createSlice({
    name: 'tickets',
    initialState: {
        mine: null,
        typesByEvent: {},
    },
    reducers: {
        setMyTickets: (state, action) => {
            state.mine = action.payload;
        },
        setTicketTypes: (state, action) => {
            const { eventId, ticketTypes } = action.payload;
            state.typesByEvent[eventId] = ticketTypes;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(clearUser, (state) => {
            state.mine = null;
        });
    },
});

export const { setMyTickets, setTicketTypes } = ticketsSlice.actions;

export const selectMyTickets = (state) => state.tickets.mine;
export const selectTicketTypes = (eventId) => (state) => state.tickets.typesByEvent[eventId] ?? null;

export default ticketsSlice.reducer;
