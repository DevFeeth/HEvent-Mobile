import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import EventStatusBanner from './EventStatusBanner';
import { COLORS } from '../constants/colors';
import { formatDateTime } from '../utils/formatDateTime';

export default function OrganizerEventCard({ event, categoryLabel, onScan, onEdit, onDelete }) {
    return (
        <View style={styles.card}>
            <EventStatusBanner status={event.status} />

            <View style={styles.body}>
                <View style={styles.top}>
                    {event.image_url ? (
                        <Image source={{ uri: event.image_url }} style={styles.image} />
                    ) : (
                        <View style={[styles.image, styles.imagePlaceholder]}>
                            <Ionicons name="image-outline" size={24} color={COLORS.white} />
                        </View>
                    )}

                    <View style={styles.info}>
                        <Text style={styles.name} numberOfLines={1}>
                            {event.name}
                        </Text>
                        <Text style={styles.meta} numberOfLines={1}>
                            {categoryLabel} · {formatDateTime(event.start_date, event.start_time)}
                        </Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <Pressable
                        onPress={onScan}
                        style={({ pressed }) => [styles.action, styles.edit, pressed && styles.pressed]}
                    >
                        <Ionicons name="qr-code-outline" size={16} color={COLORS.navy} />
                        <Text style={styles.editText}>Scan QR</Text>
                    </Pressable>
                    <Pressable
                        onPress={onEdit}
                        style={({ pressed }) => [styles.action, styles.edit, pressed && styles.pressed]}
                    >
                        <Ionicons name="pencil-outline" size={16} color={COLORS.navy} />
                        <Text style={styles.editText}>Modifier</Text>
                    </Pressable>
                    <Pressable
                        onPress={onDelete}
                        style={({ pressed }) => [styles.action, styles.delete, pressed && styles.pressed]}
                    >
                        <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                        <Text style={styles.deleteText}>Supprimer</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 18,
        overflow: 'hidden',
    },
    body: {
        padding: 12,
        gap: 12,
    },
    top: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 12,
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
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    meta: {
        fontSize: 13,
        color: COLORS.navyLight,
        opacity: 0.75,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    action: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 40,
        borderRadius: 12,
    },
    edit: {
        backgroundColor: '#e9eef5',
    },
    editText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.navy,
    },
    delete: {
        backgroundColor: '#fff1f1',
    },
    deleteText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.error,
    },
    pressed: {
        opacity: 0.75,
    },
});
