import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ConfirmPopup from './ConfirmPopup';
import ErrorPopup from './ErrorPopup';
import TicketTypeSheet from './TicketTypeSheet';
import { COLORS } from '../constants/colors';
import useFetch from '../hooks/useFetch';
import { getEventTickets } from '../services/ticketService';
import { deleteTicketType, getTicketTypesByEvent } from '../services/ticketTypeService';
import { formatPrice } from '../utils/formatPrice';

const MESSAGES = {
    409: {
        title: 'Action impossible',
        message: 'Des billets de ce type ont déjà été vendus, il ne peut pas être supprimé.',
    },
};

// available_quantity = nombre total de billets du type (fixe).
// Les vendus se calculent à partir des billets de l'événement (hors annulés), par type.
const countSoldByType = (tickets) =>
    tickets
        .filter((t) => t.status !== 'CANCELLED')
        .reduce((acc, t) => ({ ...acc, [t.ticket_type_id]: (acc[t.ticket_type_id] ?? 0) + 1 }), {});
const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

export default function TicketTypeSection({ event }) {
    const types = useFetch(() => getTicketTypesByEvent(event.id), [event.id]);
    const sold = useFetch(() => getEventTickets(event.id).then(countSoldByType), [event.id]);

    const [sheet, setSheet] = useState({ visible: false, ticketType: null });
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState(null);

    const list = types.data ?? [];
    const soldByType = sold.data ?? {};
    const ready = types.data != null && sold.data != null;
    const soldOf = (ticketType) => soldByType[ticketType.id] ?? 0;
    const total = list.reduce((sum, t) => sum + Number(t.available_quantity), 0);
    const soldTotal = list.reduce((sum, t) => sum + soldOf(t), 0);

    const openSheet = (ticketType = null) => setSheet({ visible: true, ticketType });
    const closeSheet = () => setSheet((s) => ({ ...s, visible: false }));

    const onSaved = () => {
        closeSheet();
        types.refetch();
    };

    const [toDelete, setToDelete] = useState(null);
    // Avec des billets vendus, l'API refuse la suppression : on l'explique directement
    const confirmDelete = (ticketType) =>
        soldOf(ticketType) > 0 ? setError(MESSAGES[409]) : setToDelete(ticketType);

    const remove = async (ticketType) => {
        setBusyId(ticketType.id);
        try {
            await deleteTicketType(ticketType.id);
            await types.refetch();
        } catch (err) {
            setError(err);
        } finally {
            setBusyId(null);
        }
    };

    const loadError = types.error ?? sold.error;
    const retryLoad = () => {
        types.refetch();
        sold.refetch();
    };

    return (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Types de billets</Text>
            <Text style={styles.subtitle}>Les changements sont enregistrés immédiatement.</Text>

            {/* Capacité calculée */}
            {ready && (
                <View style={styles.capacityBox}>
                    <View style={styles.capacityIcon}>
                        <Ionicons name="people-outline" size={20} color={COLORS.white} />
                    </View>
                    <View style={styles.capacityText}>
                        <Text style={styles.capacityTotal}>{plural(total, 'place')} au total</Text>
                        <Text style={styles.capacityDetail}>
                            {plural(soldTotal, 'vendue')} · {plural(total - soldTotal, 'restante')}
                        </Text>
                    </View>
                </View>
            )}

            {!ready && !loadError ? (
                <ActivityIndicator color={COLORS.navy} style={styles.loader} />
            ) : loadError ? (
                <Pressable onPress={retryLoad} style={styles.retry}>
                    <Ionicons name="refresh" size={16} color={COLORS.error} />
                    <Text style={styles.retryText}>Impossible de charger les billets. Réessayer</Text>
                </Pressable>
            ) : list.length === 0 ? (
                <Text style={styles.empty}>
                    Aucun type de billet : l’événement ne peut pas encore être réservé.
                </Text>
            ) : (
                <View style={styles.list}>
                    {list.map((t) => (
                        <View key={t.id} style={styles.row}>
                            <View style={styles.rowInfo}>
                                <View style={styles.rowTop}>
                                    <Text style={styles.rowName} numberOfLines={1}>
                                        {t.name}
                                    </Text>
                                    <Text style={styles.rowPrice}>{formatPrice(t.price)}</Text>
                                </View>
                                {!!t.description && (
                                    <Text style={styles.rowDescription} numberOfLines={2}>
                                        {t.description}
                                    </Text>
                                )}
                                <Text style={styles.rowMeta}>
                                    {plural(soldOf(t), 'vendu')} / {plural(t.available_quantity, 'place')}
                                </Text>
                                <View style={styles.progress}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${Math.min(100, t.available_quantity ? (soldOf(t) / t.available_quantity) * 100 : 0)}%`,
                                            },
                                            soldOf(t) >= t.available_quantity && styles.progressFull,
                                        ]}
                                    />
                                </View>
                            </View>
                            <View style={styles.rowActions}>
                                <Pressable
                                    onPress={() => openSheet(t)}
                                    hitSlop={6}
                                    style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                                >
                                    <Ionicons name="pencil-outline" size={18} color={COLORS.navy} />
                                </Pressable>
                                <Pressable
                                    onPress={() => confirmDelete(t)}
                                    disabled={busyId === t.id}
                                    hitSlop={6}
                                    style={({ pressed }) => [
                                        styles.iconButton,
                                        styles.iconButtonDelete,
                                        pressed && styles.pressed,
                                    ]}
                                >
                                    {busyId === t.id ? (
                                        <ActivityIndicator size="small" color={COLORS.error} />
                                    ) : (
                                        <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {ready && (
                <Pressable
                    onPress={() => openSheet()}
                    style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
                >
                    <Ionicons name="add" size={20} color={COLORS.navy} />
                    <Text style={styles.addText}>Ajouter un type de billet</Text>
                </Pressable>
            )}

            <TicketTypeSheet
                visible={sheet.visible}
                eventId={event.id}
                ticketType={sheet.ticketType}
                sold={sheet.ticketType ? soldOf(sheet.ticketType) : 0}
                onClose={closeSheet}
                onSaved={onSaved}
            />
            <ErrorPopup error={error} onClose={() => setError(null)} messages={MESSAGES} />
            <ConfirmPopup
                visible={!!toDelete}
                title="Supprimer le type de billet ?"
                message={`Voulez-vous vraiment supprimer « ${toDelete?.name ?? ''} » ? Cette action est définitive.`}
                confirmLabel="Supprimer"
                destructive
                onConfirm={() => {
                    const ticketType = toDelete;
                    setToDelete(null);
                    remove(ticketType);
                }}
                onCancel={() => setToDelete(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 28,
        padding: 22,
        shadowColor: COLORS.navy,
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: 13, color: COLORS.navyLight, opacity: 0.7, marginTop: 4, marginBottom: 16 },

    capacityBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 16,
        backgroundColor: COLORS.background,
        marginBottom: 14,
    },
    capacityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.navy,
    },
    capacityText: { flex: 1, gap: 2 },
    capacityTotal: { fontSize: 17, fontWeight: '700', color: COLORS.text },
    capacityDetail: { fontSize: 13, color: COLORS.navyLight },

    loader: { marginVertical: 16 },
    retry: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 12 },
    retryText: { fontSize: 14, color: COLORS.error, fontWeight: '600' },
    empty: { fontSize: 14, color: COLORS.navyLight, marginBottom: 12, lineHeight: 20 },

    list: { gap: 10 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    rowInfo: { flex: 1, gap: 3 },
    rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rowName: { flexShrink: 1, fontSize: 16, fontWeight: '700', color: COLORS.text },
    rowPrice: { fontSize: 15, fontWeight: '700', color: COLORS.navyLight },
    rowDescription: { fontSize: 13, color: COLORS.navyLight, opacity: 0.8, lineHeight: 18 },
    rowMeta: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
    progress: {
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.background,
        overflow: 'hidden',
        marginTop: 4,
    },
    progressFill: { height: '100%', borderRadius: 3, backgroundColor: COLORS.navyLight },
    progressFull: { backgroundColor: COLORS.success },
    rowActions: { flexDirection: 'row', gap: 8 },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
    iconButtonDelete: { backgroundColor: 'rgba(255, 67, 67, 0.08)' },

    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: COLORS.navyLight,
        marginTop: 14,
    },
    addText: { fontSize: 15, fontWeight: '700', color: COLORS.navy },
    pressed: { opacity: 0.75 },
});
