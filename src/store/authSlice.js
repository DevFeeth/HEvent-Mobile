import { createSlice } from '@reduxjs/toolkit';

// État global de l'utilisateur connecté.
// loading : true tant que la session enregistrée n'a pas été vérifiée au démarrage.
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: true,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.loading = false;
        },
        clearUser: (state) => {
            state.user = null;
            state.loading = false;
        },
    },
});

export const { setUser, clearUser } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;
