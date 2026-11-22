import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useDispatch } from 'react-redux';

import { setConnected } from '../store/networkSlice';

// Écoute l'état du réseau du téléphone et le range dans le store.
// isConnected vaut null tant que l'état est inconnu : on ne considère hors ligne que false.
export default function useNetworkStatus() {
    const dispatch = useDispatch();

    useEffect(
        () => NetInfo.addEventListener((state) => dispatch(setConnected(state.isConnected !== false))),
        [dispatch]
    );
}
