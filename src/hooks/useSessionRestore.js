import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import * as userService from '../services/userService';
import { loadToken } from '../services/tokenStorage';
import { clearUser, setUser } from '../store/authSlice';
import useAuth from './useAuth';

// Au démarrage : reprend la session enregistrée dans le SecureStore.
// Ensuite : déconnecte l'utilisateur si l'API refuse son token (401).
export default function useSessionRestore() {
    const dispatch = useDispatch();
    const { logout } = useAuth();

    useEffect(() => {
        setUnauthorizedHandler(logout);
        return () => setUnauthorizedHandler(null);
    }, [logout]);

    useEffect(() => {
        loadToken()
            .then(async (token) => {
                if (!token) {
                    dispatch(clearUser());
                    return;
                }
                setAuthToken(token);
                dispatch(setUser(await userService.getMe()));
            })
            .catch((err) => {
                if (err.status === 401 || err.status === 404) return logout();
                // API injoignable : on garde le token pour réessayer au prochain lancement
                dispatch(clearUser());
            });
    }, [dispatch, logout]);
}
