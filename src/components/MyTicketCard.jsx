import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/colors';
import { formatLongDate, formatTimeRange } from '../utils/formatDateTime';

const BADGES = {
    USED: { label: 'Utilisé', color: COLORS.success },
    CANCELLED: { label: 'Annulé', color: COLORS.error },
    PAST: { label: 'Terminé', color: COLORS.navyLight },
};

export default function MyTicketCard({ ticket, categoryLabel, badge, onShow, onTransfer }) {
    const { ticket_type: type } = ticket;
    const event = type.event;
    const badgeStyle = badge && BADGES[badge];

    return (
        <View style={[styles.card, badge && styles.cardPast]}>
            <View style={styles.top}>
                {event.image_url ? (
                    <Image source={{ uri: event.image_url }} style={styles.image} />
                ) : (
                    <View style={[styles.image, styles.imagePlaceholder]}>
                        <Ionicons name="musical-notes-outline" size={26} color={COLORS.white} />
                    </View>
                )}

                <View style={styles.info}>
                    <View style={styles.titleRow}>
                        <Text style={styles.name} numberOfLines={1}>
                            {event.name}
                        </Text>
                        {badgeStyle && (
                            <View style={[styles.badge, { borderColor: badgeStyle.color }]}>
                                <Text style={[styles.badgeText, { color: badgeStyle.color }]}>{badgeStyle.label}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.meta} numberOfLines={1}>
                        {categoryLabel} • {formatLongDate(event.start_date)}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                        {formatTimeRange(event.start_time, event.end_time)}
                    </Text>
                </View>
            </View>

            <Text style={styles.typeLine} numberOfLines={1}>
                {[type.name, type.description].filter(Boolean).join(' • ')}
            </Text>

            {!badge && (
                <View style={styles.actions}>
                    <Pressable
                        onPress={onShow}
                        style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                    >
                        <Text style={styles.primaryText}>Voir le billet</Text>
                    </Pressable>
                    <Pressable
                        onPress={onTransfer}
                        style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
                    >
                        <Text style={styles.secondaryText}>Transférer</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardPast: { opacity: 0.85 },
    top: { flexDirection: 'row', gap: 12 },
    image: { width: 64, height: 64, borderRadius: 12 },
    imagePlaceholder: {
        backgroundColor: COLORS.navyLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: { flex: 1, justifyContent: 'center', gap: 3 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    name: { flexShrink: 1, fontSize: 18, fontWeight: '700', color: COLORS.text },
    meta: { fontSize: 13, color: COLORS.navyLight, opacity: 0.85 },
    badge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
    badgeText: { fontSize: 11, fontWeight: '700' },
    typeLine: { fontSize: 13, color: COLORS.navyLight, opacity: 0.85 },
    actions: { flexDirection: 'row', gap: 8 },
    button: {
        flex: 1,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primary: { backgroundColor: COLORS.navy },
    primaryText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
    secondary: { backgroundColor: COLORS.bar },
    secondaryText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
    pressed: { opacity: 0.8 },
});
