import { createSlice } from '@reduxjs/toolkit';

import { clearUser } from './authSlice';

// null : pas encore chargé (différent d'une liste vide)
const eventsSlice = createSlice({
    name: 'events',
    initialState: {
        list: null,
        upcoming: null,
        mine: null,
    },
    reducers: {
        setEvents: (state, action) => {
            state.list = action.payload;
        },
        setUpcomingEvents: (state, action) => {
            state.upcoming = action.payload;
        },
        setMyEvents: (state, action) => {
            state.mine = action.payload;
        },
        eventRemoved: (state, action) => {
            const keep = (events) => events?.filter((event) => event.id !== action.payload) ?? null;
            state.list = keep(state.list);
            state.upcoming = keep(state.upcoming);
            state.mine = keep(state.mine);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(clearUser, (state) => {
            state.mine = null;
        });
    },
});

export const { setEvents, setUpcomingEvents, setMyEvents, eventRemoved } = eventsSlice.actions;

export const selectEvents = (state) => state.events.list;
export const selectUpcomingEvents = (state) => state.events.upcoming;
export const selectMyEvents = (state) => state.events.mine;

export default eventsSlice.reducer;
