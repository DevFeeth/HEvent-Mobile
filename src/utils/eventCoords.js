export function eventCoords(event) {
    if (event.latitude == null || event.longitude == null) return null;
    return { latitude: Number(event.latitude), longitude: Number(event.longitude) };
}
