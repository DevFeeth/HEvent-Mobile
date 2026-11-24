import { createSlice } from '@reduxjs/toolkit';

// addedIds : ids des événements ajoutés au calendrier du téléphone pendant cette session
const calendarSlice = createSlice({
    name: 'calendar',
    initialState: {
        addedIds: [],
    },
    reducers: {
        eventAddedToCalendar: (state, action) => {
            if (!state.addedIds.includes(action.payload)) state.addedIds.push(action.payload);
        },
    },
});

export const { eventAddedToCalendar } = calendarSlice.actions;

export const selectIsInCalendar = (eventId) => (state) => state.calendar.addedIds.includes(eventId);

export default calendarSlice.reducer;
