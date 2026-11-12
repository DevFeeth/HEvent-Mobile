import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { COLORS } from '../constants/colors';
import useFetch from '../hooks/useFetch';
import { formatDistance } from '../utils/distance';
import { eventCoords } from '../utils/eventCoords';
import { formatLongDate } from '../utils/formatDateTime';

// "Rue de Fer 12, Namur" — sans rue connue, on garde seulement la ville
function formatAddress(place) {
    if (!place) return null;
    const street = [place.street, place.streetNumber].filter(Boolean).join(' ');
    return [street, place.city].filter(Boolean).join(', ') || null;
}

export default function UpcomingEventCard({ event, categoryLabel, userLocation, distance }) {
    const coords = eventCoords(event);
    const canLocate = !!coords && !!userLocation;

    const { data: places } = useFetch(
        () => (canLocate ? Location.reverseGeocodeAsync(coords) : Promise.resolve(null)),
        [event.id, coords?.latitude, coords?.longitude, canLocate]
    );
    const place = formatAddress(places?.[0]);

    return (
        <View style={styles.card}>
            {event.image_url ? (
                <Image source={{ uri: event.image_url }} style={styles.image} />
            ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                    <Ionicons name="musical-notes-outline" size={26} color={COLORS.white} />
                </View>
            )}

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                    {event.name}
                </Text>
                <View style={styles.row}>
                    <Text style={styles.meta} numberOfLines={1}>
                        {categoryLabel} • {formatLongDate(event.start_date)}
                    </Text>
                    {distance != null && <Text style={styles.distance}>{formatDistance(distance)}</Text>}
                </View>

                {canLocate && !!place && (
                    <View style={styles.place}>
                        <Ionicons name="location-outline" size={14} color={COLORS.navy} />
                        <Text style={styles.placeText} numberOfLines={1}>
                            {place}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 12,
    },
    image: {
        width: 72,
        height: 72,
        borderRadius: 14,
    },
    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.navyLight,
    },
    info: {
        flex: 1,
        gap: 4,
    },
    name: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    meta: {
        flex: 1,
        fontSize: 13,
        color: COLORS.navyLight,
        opacity: 0.75,
    },
    place: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    placeText: {
        flexShrink: 1,
        fontSize: 13,
        color: COLORS.text,
    },
    distance: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
    },
});
