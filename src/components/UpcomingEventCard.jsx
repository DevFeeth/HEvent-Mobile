import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import EventImage from './EventImage';
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

export default function UpcomingEventCard({ event, categoryLabel, userLocation, distance, onPress }) {
    const coords = eventCoords(event);
    const canLocate = !!coords && !!userLocation;

    const { data: places } = useFetch(
        () => (canLocate ? Location.reverseGeocodeAsync(coords) : Promise.resolve(null)),
        [event.id, coords?.latitude, coords?.longitude, canLocate]
    );
    const place = formatAddress(places?.[0]);
    const showPlace = canLocate && !!place;

    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <EventImage uri={event.image_url} style={styles.image} iconSize={26} />

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                    {event.name}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                    {categoryLabel} • {formatLongDate(event.start_date)}
                </Text>

                {(showPlace || Number.isFinite(distance)) && (
                    <View style={styles.row}>
                        {showPlace && (
                            <View style={styles.place}>
                                <Ionicons name="location-outline" size={14} color={COLORS.navy} />
                                <Text style={styles.placeText} numberOfLines={1} ellipsizeMode="tail">
                                    {place}
                                </Text>
                            </View>
                        )}
                        {Number.isFinite(distance) && <Text style={styles.distance}>{formatDistance(distance)}</Text>}
                    </View>
                )}
            </View>
        </Pressable>
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
    info: {
        flex: 1,
        minWidth: 0,
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
        fontSize: 13,
        color: COLORS.navyLight,
        opacity: 0.75,
    },
    place: {
        flex: 1,
        minWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    placeText: {
        flex: 1,
        minWidth: 0,
        fontSize: 13,
        color: COLORS.text,
    },
    distance: {
        flexShrink: 0,
        marginLeft: 'auto',
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
    },
});
