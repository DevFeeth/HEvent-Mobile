import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export default function useUserLocation() {
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        let active = true;

        const locate = async () => {
            const { granted } = await Location.requestForegroundPermissionsAsync();
            if (!granted) return;

            const last = await Location.getLastKnownPositionAsync();
            if (active && last) setCoords(last.coords);

            const current = await Location.getCurrentPositionAsync();
            if (active) setCoords(current.coords);
        };

        locate().catch((err) => console.warn('Localisation indisponible :', err.message));

        return () => {
            active = false;
        };
    }, []);

    return coords;
}
