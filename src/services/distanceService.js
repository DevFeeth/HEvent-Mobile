import { GOOGLE_MAPS_API_KEY } from '../api/config';
import { ApiError } from '../utils/ApiError';

const ROUTE_MATRIX_URL = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';
const FIELDS = 'destinationIndex,distanceMeters,condition';

const toWaypoint = ({ latitude, longitude }) => ({
    waypoint: { location: { latLng: { latitude, longitude } } },
});

async function getDrivingDistances(origin, destinations) {
    if (!GOOGLE_MAPS_API_KEY) throw new ApiError(0, 'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is missing');

    let response;
    try {
        response = await fetch(ROUTE_MATRIX_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': FIELDS,
            },
            body: JSON.stringify({
                origins: [toWaypoint(origin)],
                destinations: destinations.map(toWaypoint),
                travelMode: 'DRIVE',
            }),
        });
    } catch (err) {
        throw new ApiError(0, err.message);
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const error = Array.isArray(data) ? data[0]?.error : data?.error;
        throw new ApiError(response.status, error?.message ?? response.statusText);
    }

    const distances = destinations.map(() => null);
    for (const element of data ?? []) {
        if (element.condition !== 'ROUTE_EXISTS') continue;
        distances[element.destinationIndex ?? 0] = (element.distanceMeters ?? 0) / 1000;
    }
    return distances;
}

const EARTH_RADIUS_KM = 6371;
const toRad = (degrees) => (degrees * Math.PI) / 180;

// Distance à vol d'oiseau (formule de haversine)
export function straightDistance(from, to) {
    const dLat = toRad(to.latitude - from.latitude);
    const dLon = toRad(to.longitude - from.longitude);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// Distances en voiture (Google Routes) ; sans clé valide ou sans réseau Google, distances à vol d'oiseau
export async function getDistances(origin, destinations) {
    try {
        const km = await getDrivingDistances(origin, destinations);
        return km.map((distance, i) => distance ?? straightDistance(origin, destinations[i]));
    } catch (err) {
        if (__DEV__) console.warn(`Google Routes indisponible (${err.message}) : distances à vol d'oiseau`);
        return destinations.map((destination) => straightDistance(origin, destination));
    }
}
