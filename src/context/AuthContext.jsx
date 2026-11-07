import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { setAuthToken } from '../api/client';
import * as userService from '../services/userService';

const TOKEN_KEY = 'hevent_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(async () => {
        userService.logout();
        setUser(null);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    }, []);

    useEffect(() => {
        SecureStore.getItemAsync(TOKEN_KEY)
            .then(async (token) => {
                if (!token) return;
                setAuthToken(token);
                setUser(await userService.getMe());
            })
            .catch((err) => {
                if (err.status === 401 || err.status === 404) return logout();
            })
            .finally(() => setLoading(false));
    }, [logout]);

    const login = useCallback(async (email, password) => {
        const token = await userService.login(email, password);
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        setUser(await userService.getMe());
    }, []);

    const register = useCallback(
        async (form) => {
            await userService.register(form);
            await login(form.email, form.password);
        },
        [login]
    );

    const value = useMemo(
        () => ({ user, loading, login, register, logout }),
        [user, loading, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
