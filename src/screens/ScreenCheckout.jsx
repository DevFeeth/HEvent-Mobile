import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import ConfirmPopup from '../components/ConfirmPopup';
import ErrorPopup from '../components/ErrorPopup';
import LoadingPopup from '../components/LoadingPopup';
import { API_MESSAGES } from '../constants/apiMessages';
import { COLORS } from '../constants/colors';
import { cancelOrder, payOrder } from '../services/orderService';
import { formatPrice } from '../utils/formatPrice';

// Même durée que dans l'API (ORDER_LIFETIME_IN_MS)
const ORDER_LIFETIME_MS = 15 * 60 * 1000;

// Moyens de paiement simulés acceptés par l'API (src/utils/fakeStripe.js)
const PAYMENT_METHODS = [
    { value: 'pm_card_visa', label: 'Visa •••• 4242', hint: 'Carte de test acceptée' },
    { value: 'pm_card_chargeDeclined', label: 'Visa •••• 0002', hint: 'Carte de test refusée' },
];

// Délai dépassé côté app : même message que le refus de l'API
const EXPIRED = API_MESSAGES['This order has expired'];

const formatCountdown = (ms) => {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

// Billets de la commande regroupés par type : [{ name, count, total }]
const groupTickets = (tickets) =>
    Object.values(
        tickets.reduce((acc, ticket) => {
            const { id, name } = ticket.ticket_type;
            acc[id] ??= { name, count: 0, total: 0 };
            acc[id].count += 1;
            acc[id].total += Number(ticket.purchase_price);
            return acc;
        }, {})
    );

export default function ScreenCheckout() {
    const navigation = useNavigation();
    const { order, eventName } = useRoute().params;

    const [method, setMethod] = useState(PAYMENT_METHODS[0].value);
    const [busy, setBusy] = useState(null);
    const [error, setError] = useState(null);
    const [expired, setExpired] = useState(false);
    const [pendingLeave, setPendingLeave] = useState(null);
    const allowLeave = useRef(false);

    const deadline = new Date(order.created_at).getTime() + ORDER_LIFETIME_MS;
    const [remaining, setRemaining] = useState(() => deadline - Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            const left = deadline - Date.now();
            setRemaining(left);
            if (left <= 0) {
                clearInterval(timer);
                setExpired(true);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [deadline]);

    // Quitter le paiement annule la commande : les billets sont remis en vente tout de suite
    useEffect(
        () =>
            navigation.addListener('beforeRemove', (e) => {
                if (allowLeave.current) return;
                e.preventDefault();
                setPendingLeave(e.data.action);
            }),
        [navigation]
    );

    const leave = (action) => {
        allowLeave.current = true;
        if (action) navigation.dispatch(action);
        else navigation.goBack();
    };

    const lines = useMemo(() => groupTickets(order.ticket), [order.ticket]);
    const discount = Number(order.discount_amount);

    const pay = async () => {
        setBusy('pay');
        try {
            await payOrder(order.id, method);
            leave();
            navigation.navigate('Tickets');
        } catch (err) {
            setError(err);
        } finally {
            setBusy(null);
        }
    };

    const confirmLeave = async () => {
        const action = pendingLeave;
        setPendingLeave(null);
        setBusy('cancel');
        try {
            await cancelOrder(order.id);
        } catch {
            // Déjà annulée ou expirée : l'API libère les billets de toute façon
        } finally {
            setBusy(null);
            leave(action);
        }
    };

    // Le job de l'API l'annulerait dans la minute : on le fait tout de suite pour libérer les places
    const closeExpired = () => cancelOrder(order.id).catch(() => {}).finally(() => leave());

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    hitSlop={8}
                    style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
                </Pressable>
                <View style={styles.headerText}>
                    <Text style={styles.title}>Paiement</Text>
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {eventName}
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.timer}>
                    <Ionicons name="time-outline" size={20} color={COLORS.navy} />
                    <Text style={styles.timerText}>
                        Billets réservés pendant <Text style={styles.timerValue}>{formatCountdown(remaining)}</Text>
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Récapitulatif</Text>
                <View style={styles.card}>
                    {lines.map((line) => (
                        <View key={line.name} style={styles.row}>
                            <Text style={styles.rowLabel}>
                                {line.count} × {line.name}
                            </Text>
                            <Text style={styles.rowValue}>{formatPrice(line.total)}</Text>
                        </View>
                    ))}
                    <View style={styles.separator} />
                    <View style={styles.row}>
                        <Text style={styles.rowMuted}>Sous-total</Text>
                        <Text style={styles.rowMuted}>{formatPrice(order.subtotal)}</Text>
                    </View>
                    {discount > 0 && (
                        <View style={styles.row}>
                            <Text style={styles.rowDiscount}>Code {order.promo_code?.code}</Text>
                            <Text style={styles.rowDiscount}>− {formatPrice(discount)}</Text>
                        </View>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Moyen de paiement</Text>
                <View style={styles.methods}>
                    {PAYMENT_METHODS.map((m) => {
                        const selected = m.value === method;
                        return (
                            <Pressable
                                key={m.value}
                                onPress={() => setMethod(m.value)}
                                accessibilityRole="radio"
                                accessibilityState={{ selected }}
                                style={[styles.method, selected && styles.methodSelected]}
                            >
                                <Ionicons name="card-outline" size={22} color={COLORS.navy} />
                                <View style={styles.methodText}>
                                    <Text style={styles.methodLabel}>{m.label}</Text>
                                    <Text style={styles.methodHint}>{m.hint}</Text>
                                </View>
                                <Ionicons
                                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                                    size={22}
                                    color={selected ? COLORS.navy : COLORS.textMuted}
                                />
                            </Pressable>
                        );
                    })}
                </View>
                <Text style={styles.note}>Paiement simulé : aucune carte réelle n’est débitée.</Text>
            </ScrollView>

            <Pressable
                onPress={pay}
                disabled={!!busy || expired}
                style={({ pressed }) => [styles.payButton, (pressed || busy || expired) && styles.dim]}
            >
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.white} />
                <Text style={styles.payText}>Payer {formatPrice(order.total)}</Text>
            </Pressable>

            <LoadingPopup
                visible={!!busy}
                title={busy === 'pay' ? 'Paiement en cours...' : 'Annulation...'}
                message={busy === 'pay' ? 'Merci de patienter.' : 'Vos billets sont remis en vente.'}
            />
            <ErrorPopup error={error} onClose={() => setError(null)} />
            <ErrorPopup error={expired && !busy ? EXPIRED : null} onClose={closeExpired} />
            <ConfirmPopup
                visible={!!pendingLeave}
                title="Abandonner la commande ?"
                message="Vos billets réservés seront remis en vente."
                confirmLabel="Abandonner"
                cancelLabel="Continuer le paiement"
                destructive
                icon="close-circle-outline"
                onConfirm={confirmLeave}
                onCancel={() => setPendingLeave(null)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 12 },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    headerText: { flex: 1 },
    title: { fontSize: 26, fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: 14, color: COLORS.navyLight, opacity: 0.8 },
    content: { paddingHorizontal: 20, paddingBottom: 200 },

    timer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 14,
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 18,
    },
    timerText: { fontSize: 14, color: COLORS.navyLight },
    timerValue: { fontWeight: '800', color: COLORS.navy },

    sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 24, marginBottom: 8 },
    card: {
        gap: 10,
        padding: 16,
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 18,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    rowLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text },
    rowValue: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    rowMuted: { fontSize: 14, color: COLORS.navyLight },
    rowDiscount: { fontSize: 14, fontWeight: '600', color: COLORS.success },
    separator: { height: 1, backgroundColor: COLORS.border },
    totalLabel: { fontSize: 18, fontWeight: '800', color: COLORS.navy },
    totalValue: { fontSize: 18, fontWeight: '800', color: COLORS.navy },

    methods: { gap: 10 },
    method: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 18,
    },
    methodSelected: { borderColor: COLORS.navy, borderWidth: 2 },
    methodText: { flex: 1 },
    methodLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    methodHint: { fontSize: 12, color: COLORS.navyLight, opacity: 0.75 },
    note: { fontSize: 12, color: COLORS.navyLight, opacity: 0.7, marginTop: 10, textAlign: 'center' },

    payButton: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 104,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 58,
        backgroundColor: COLORS.navy,
        borderRadius: 20,
    },
    payText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
    dim: { opacity: 0.55 },
    pressed: { opacity: 0.8 },
});
