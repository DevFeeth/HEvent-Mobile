import { GOOGLE_MAPS_API_KEY } from '../api/config';
import { ApiError } from '../utils/ApiError';

const ROUTE_MATRIX_URL = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';
const FIELDS = 'destinationIndex,distanceMeters,condition';

const toWaypoint = ({ latitude, longitude }) => ({
    waypoint: { location: { latLng: { latitude, longitude } } },
});

export async function getDrivingDistances(origin, destinations) {
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
