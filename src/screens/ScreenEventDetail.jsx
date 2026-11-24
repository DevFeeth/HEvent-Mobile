import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import BottomFade from '../components/BottomFade';
import ConfirmPopup from '../components/ConfirmPopup';
import ErrorPopup from '../components/ErrorPopup';
import Field from '../components/Field';
import LoadingPopup from '../components/LoadingPopup';
import SuccessPopup from '../components/SuccessPopup';
import EventImage from '../components/EventImage';
import { COLORS } from '../constants/colors';
import useCategories from '../hooks/useCategories';
import useFetch from '../hooks/useFetch';
import useStoreLoader from '../hooks/useStoreLoader';
import { createOrder } from '../services/orderService';
import { getTicketTypesByEvent } from '../services/ticketTypeService';
import { selectUser } from '../store/authSlice';
import { selectTicketTypes, setTicketTypes } from '../store/ticketsSlice';
import { formatDistance } from '../utils/distance';
import { eventCoords } from '../utils/eventCoords';
import { formatLongDate, formatTimeRange } from '../utils/formatDateTime';
import { formatPrice } from '../utils/formatPrice';

const MAX_PER_TYPE = 10;

function formatAddress(place) {
    if (!place) return null;
    const street = [place.street, place.streetNumber].filter(Boolean).join(' ');
    return [street, place.city].filter(Boolean).join(', ') || null;
}

export default function ScreenEventDetail() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { event, distance } = useRoute().params;
    const { categoryLabel } = useCategories();

    const user = useSelector(selectUser);
    const ticketData = useSelector(selectTicketTypes(event.id));
    const { refetch } = useStoreLoader(
        (signal) => getTicketTypesByEvent(event.id, signal),
        (ticketTypes) => setTicketTypes({ eventId: event.id, ticketTypes }),
        [event.id]
    );
    const ticketTypes = useMemo(() => ticketData ?? [], [ticketData]);

    const [quantities, setQuantities] = useState({});
    const [promoCode, setPromoCode] = useState('');
    const [ordering, setOrdering] = useState(false);
    const [error, setError] = useState(null);
    const [loginPrompt, setLoginPrompt] = useState(false);
    const [freeOrderDone, setFreeOrderDone] = useState(false);

    // Au retour du paiement (ou d'une commande abandonnée), le stock restant a changé
    const firstFocus = useRef(true);
    useFocusEffect(
        useCallback(() => {
            if (firstFocus.current) {
                firstFocus.current = false;
                return;
            }
            refetch();
        }, [refetch])
    );

    const coords = eventCoords(event);
    const { data: places } = useFetch(
        () => (coords ? Location.reverseGeocodeAsync(coords) : Promise.resolve(null)),
        [event.id, coords?.latitude, coords?.longitude]
    );
    const address = formatAddress(places?.[0]);

    const { count, total } = useMemo(
        () =>
            ticketTypes.reduce(
                (acc, type) => {
                    const qty = quantities[type.id] ?? 0;
                    return { count: acc.count + qty, total: acc.total + qty * Number(type.price) };
                },
                { count: 0, total: 0 }
            ),
        [ticketTypes, quantities]
    );

    // remaining_quantity : billets encore en vente (available_quantity est le total du type)
    const soldOut = ticketTypes.length > 0 && ticketTypes.every((t) => t.remaining_quantity <= 0);

    const change = (type, delta) =>
        setQuantities((q) => {
            const max = Math.min(type.remaining_quantity, MAX_PER_TYPE);
            const next = Math.min(Math.max((q[type.id] ?? 0) + delta, 0), max);
            return { ...q, [type.id]: next };
        });

    const reserve = async () => {
        if (!user) {
            setLoginPrompt(true);
            return;
        }
        const items = Object.entries(quantities)
            .filter(([, quantity]) => quantity > 0)
            .map(([id, quantity]) => ({ ticket_type_id: Number(id), quantity }));

        setOrdering(true);
        try {
            const order = await createOrder(items, promoCode.trim());
            setQuantities({});
            setPromoCode('');
            // Une commande à 0 € est payée directement par l'API
            if (order.status === 'PAID') setFreeOrderDone(true);
            else navigation.navigate('Checkout', { order, eventName: event.name });
        } catch (err) {
            setError(err);
            refetch();
        } finally {
            setOrdering(false);
        }
    };

    const sameDay = event.start_date === event.end_date;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View>
                    <EventImage uri={event.image_url} style={styles.image} iconSize={56} />

                    <Pressable
                        onPress={() => navigation.goBack()}
                        hitSlop={8}
                        style={({ pressed }) => [styles.backButton, { top: insets.top + 12 }, pressed && styles.pressed]}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
                    </Pressable>

                    <View style={styles.categoryChip}>
                        <Text style={styles.categoryText}>{categoryLabel(event.category_name)}</Text>
                    </View>
                </View>

                <View style={styles.sheet}>
                    <View style={styles.titleRow}>
                        <Text style={styles.name}>{event.name}</Text>
                        {ticketTypes.length > 0 && (
                            <View style={[styles.badge, soldOut && styles.badgeSoldOut]}>
                                <Text style={[styles.badgeText, soldOut && styles.badgeTextSoldOut]}>
                                    {soldOut ? 'Complet' : 'Places disponibles'}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoCard}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="calendar-outline" size={20} color={COLORS.navy} />
                            </View>
                            <View style={styles.infoText}>
                                <Text style={styles.infoLabel}>DATE ET HEURE</Text>
                                <Text style={styles.infoValue} numberOfLines={2}>
                                    {formatLongDate(event.start_date)}
                                    {!sameDay && ` au ${formatLongDate(event.end_date)}`}
                                </Text>
                                <Text style={styles.infoSub}>
                                    {formatTimeRange(event.start_time, event.end_time)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="location-outline" size={20} color={COLORS.navy} />
                            </View>
                            <View style={styles.infoText}>
                                <Text style={styles.infoLabel}>LIEU</Text>
                                <Text style={styles.infoValue} numberOfLines={2}>
                                    {address ?? 'Lieu non précisé'}
                                </Text>
                                {Number.isFinite(distance) && <Text style={styles.infoSub}>{formatDistance(distance)}</Text>}
                            </View>
                        </View>
                    </View>

                    {!!event.description && (
                        <>
                            <Text style={styles.sectionTitle}>À propos</Text>
                            <Text style={styles.description}>{event.description}</Text>
                        </>
                    )}

                    <Text style={styles.sectionTitle}>Billetterie</Text>
                    {ticketTypes.length === 0 ? (
                        <Text style={styles.description}>Aucun billet disponible pour le moment.</Text>
                    ) : (
                        <View style={styles.tickets}>
                            {ticketTypes.map((type) => {
                                const qty = quantities[type.id] ?? 0;
                                const unavailable = type.remaining_quantity <= 0;
                                return (
                                    <View key={type.id} style={[styles.ticket, unavailable && styles.ticketOff]}>
                                        <View style={styles.ticketInfo}>
                                            <Text style={styles.ticketName} numberOfLines={1}>
                                                {type.name}
                                            </Text>
                                            {!!type.description && (
                                                <Text style={styles.ticketDesc} numberOfLines={2}>
                                                    {type.description}
                                                </Text>
                                            )}
                                        </View>
                                        <Text style={styles.price}>{formatPrice(type.price)}</Text>
                                        <View style={styles.stepper}>
                                            <Pressable
                                                onPress={() => change(type, -1)}
                                                disabled={qty === 0}
                                                hitSlop={8}
                                            >
                                                <Ionicons
                                                    name="remove-circle-outline"
                                                    size={26}
                                                    color={qty === 0 ? COLORS.textMuted : COLORS.navy}
                                                />
                                            </Pressable>
                                            <Text style={styles.qty}>{qty}</Text>
                                            <Pressable onPress={() => change(type, 1)} disabled={unavailable} hitSlop={8}>
                                                <Ionicons
                                                    name="add-circle-outline"
                                                    size={26}
                                                    color={unavailable ? COLORS.textMuted : COLORS.navy}
                                                />
                                            </Pressable>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {count > 0 && (
                        <View style={styles.promo}>
                            <Field
                                label="Code promo"
                                icon="pricetag-outline"
                                placeholder="Facultatif"
                                value={promoCode}
                                onChangeText={(v) => setPromoCode(v.toUpperCase())}
                                autoCapitalize="characters"
                                autoCorrect={false}
                                maxLength={50}
                            />
                        </View>
                    )}
                </View>
            </ScrollView>

            <BottomFade style={styles.buttonFade} />
            <Pressable
                onPress={reserve}
                disabled={count === 0 || ordering}
                style={({ pressed }) => [
                    styles.reserve,
                    (count === 0 || ordering || pressed) && styles.reserveDim,
                ]}
            >
                <Ionicons name="ticket-outline" size={22} color={COLORS.white} />
                <Text style={styles.reserveText}>{count > 0 ? `Réserver · ${formatPrice(total)}` : 'Réserver'}</Text>
            </Pressable>

            <LoadingPopup visible={ordering} title="Réservation..." message="Nous réservons vos billets." />
            <SuccessPopup
                visible={freeOrderDone}
                title="Réservation confirmée"
                message="Vos billets gratuits sont prêts, retrouvez-les dans « Mes billets »."
                buttonLabel="Voir mes billets"
                onClose={() => {
                    setFreeOrderDone(false);
                    navigation.navigate('Tickets');
                }}
            />
            <ErrorPopup error={error} onClose={() => setError(null)} />
            <ConfirmPopup
                visible={loginPrompt}
                title="Connexion requise"
                message="Connectez-vous ou créez un compte pour réserver vos billets."
                confirmLabel="Se connecter"
                icon="person-outline"
                onConfirm={() => {
                    setLoginPrompt(false);
                    navigation.navigate('Profile');
                }}
                onCancel={() => setLoginPrompt(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { paddingBottom: 200 },

    image: { width: '100%', height: 300 },
    backButton: {
        position: 'absolute',
        left: 16,
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
    },
    categoryChip: {
        position: 'absolute',
        left: 16,
        bottom: 44,
        paddingHorizontal: 14,
        paddingVertical: 7,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 16,
    },
    categoryText: { fontSize: 13, fontWeight: '800', color: COLORS.navy, textTransform: 'uppercase' },

    sheet: {
        marginTop: -28,
        paddingHorizontal: 20,
        paddingTop: 24,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    name: { flex: 1, fontSize: 28, fontWeight: '700', color: COLORS.text },
    badge: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#dcefe6', borderRadius: 14 },
    badgeSoldOut: { backgroundColor: '#fde4e4' },
    badgeText: { fontSize: 12, fontWeight: '700', color: '#1d6b4a' },
    badgeTextSoldOut: { color: COLORS.error },

    infoRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
    infoCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 18,
    },
    infoIcon: {
        width: 38,
        height: 38,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    infoText: { flex: 1 },
    infoLabel: { fontSize: 10, fontWeight: '700', color: COLORS.navyLight, opacity: 0.7 },
    infoValue: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 1 },
    infoSub: { fontSize: 12, color: COLORS.navyLight, opacity: 0.75, marginTop: 1 },

    sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 24, marginBottom: 8 },
    description: { fontSize: 15, lineHeight: 22, color: COLORS.navyLight },

    tickets: { gap: 12 },
    ticket: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 18,
    },
    ticketOff: { opacity: 0.5 },
    ticketInfo: { flex: 1 },
    ticketName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    ticketDesc: { fontSize: 12, color: COLORS.navyLight, opacity: 0.75, marginTop: 2 },
    price: { fontSize: 20, fontWeight: '800', color: COLORS.navy },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    qty: { minWidth: 22, textAlign: 'center', fontSize: 20, fontWeight: '800', color: COLORS.navy },
    promo: { marginTop: 20 },

    buttonFade: { bottom: 84, height: 110 },
    reserve: {
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
    reserveDim: { opacity: 0.55 },
    reserveText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
    pressed: { opacity: 0.8 },
});