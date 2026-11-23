import { createSlice } from '@reduxjs/toolkit';

const networkSlice = createSlice({
    name: 'network',
    initialState: {
        isConnected: true,
    },
    reducers: {
        setConnected: (state, action) => {
            state.isConnected = action.payload;
        },
    },
});

export const { setConnected } = networkSlice.actions;

export const selectIsConnected = (state) => state.network.isConnected;

export default networkSlice.reducer;
