const isMissing = (value) => value === null || value === undefined;

export function eventCoords(event) {
    if (isMissing(event.latitude) || isMissing(event.longitude)) return null;
    return { latitude: Number(event.latitude), longitude: Number(event.longitude) };
}
