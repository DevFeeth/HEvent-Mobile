import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import * as userService from '../services/userService';
import { deleteToken, saveToken } from '../services/tokenStorage';
import { clearUser, setUser } from '../store/authSlice';

// Actions de connexion : appel à l'API puis mise à jour du store avec dispatch.
// Les écrans lisent l'utilisateur avec useSelector(selectUser).
export default function useAuth() {
    const dispatch = useDispatch();

    const login = useCallback(
        async (email, password) => {
            const token = await userService.login(email, password);
            await saveToken(token);
            dispatch(setUser(await userService.getMe()));
        },
        [dispatch]
    );

    const register = useCallback(
        async (form) => {
            await userService.register(form);
            await login(form.email, form.password);
        },
        [login]
    );

    const logout = useCallback(async () => {
        userService.logout();
        dispatch(clearUser());
        await deleteToken();
    }, [dispatch]);

    const updateProfile = useCallback(
        async (data) => {
            await userService.updateMe(data);
            dispatch(setUser(await userService.getMe()));
        },
        [dispatch]
    );

    return { login, register, logout, updateProfile };
}
