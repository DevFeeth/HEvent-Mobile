import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import ErrorPopup from '../components/ErrorPopup';
import LoadingPopup from '../components/LoadingPopup';
import MyTicketCard from '../components/MyTicketCard';
import TicketQrModal from '../components/TicketQrModal';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { getCategories } from '../services/categoryService';
import { getMyTickets } from '../services/userService';

const TABS = [
    { key: 'active', label: 'Mes billets', section: 'Billets actifs' },
    { key: 'history', label: 'Historique', section: 'Historique' },
];

const TRANSFER_NOT_AVAILABLE = {
    title: 'Pas encore disponible',
    message: 'Le transfert de billet n’est pas encore disponible.',
};

const todayUtc = () => {
    const now = new Date();
    return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
};

function historyBadge(ticket, today) {
    if (ticket.status === 'CANCELLED') return 'CANCELLED';
    if (ticket.status === 'USED') return 'USED';
    if (new Date(ticket.ticket_type.event.end_date).getTime() < today) return 'PAST';
    return null;
}

export default function ScreenTickets() {
    const { user } = useAuth();
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {user ? <MyTickets userId={user.id} /> : <LoggedOut />}
        </SafeAreaView>
    );
}

function MyTickets({ userId }) {
    const navigation = useNavigation();
    const { data: tickets, loading, error: loadError, refetch } = useFetch(getMyTickets, [userId]);
    const { data: categories } = useFetch(getCategories);
    const [tab, setTab] = useState('active');
    const [shown, setShown] = useState(null);
    const [error, setError] = useState(null);

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

    const categoryLabel = (name) => categories?.find((c) => c.name === name)?.label ?? name;

    const { active, history } = useMemo(() => {
        const today = todayUtc();
        const withBadge = (tickets ?? []).map((t) => ({ ticket: t, badge: historyBadge(t, today) }));
        return {
            active: withBadge.filter((t) => !t.badge),
            // Les plus récents d'abord
            history: withBadge.filter((t) => t.badge).reverse(),
        };
    }, [tickets]);

    const list = tab === 'active' ? active : history;
    const current = TABS.find((t) => t.key === tab);

    return (
        <>
            <FlatList
                data={list}
                keyExtractor={(item) => String(item.ticket.id)}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.gap} />}
                refreshControl={
                    <RefreshControl refreshing={loading && !!tickets} onRefresh={refetch} tintColor={COLORS.navy} />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.title}>Mes achats</Text>
                        <Text style={styles.subtitle}>Consultez vos achats et accédez à vos billets.</Text>
                        <View style={styles.divider} />

                        <View style={styles.tabs}>
                            {TABS.map((t) => (
                                <Pressable
                                    key={t.key}
                                    onPress={() => setTab(t.key)}
                                    style={({ pressed }) => [
                                        styles.tab,
                                        tab === t.key && styles.tabActive,
                                        pressed && styles.pressed,
                                    ]}
                                >
                                    <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
                                        {t.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <Text style={styles.section}>
                            {current.section}
                            {tickets ? ` (${list.length})` : ''}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <MyTicketCard
                        ticket={item.ticket}
                        badge={item.badge}
                        categoryLabel={categoryLabel(item.ticket.ticket_type.event.category_name)}
                        onShow={() => setShown(item.ticket)}
                        onTransfer={() => setError(TRANSFER_NOT_AVAILABLE)}
                    />
                )}
                ListEmptyComponent={
                    loadError && !tickets ? (
                        <View style={styles.empty}>
                            <Ionicons name="cloud-offline-outline" size={40} color={COLORS.textMuted} />
                            <Text style={styles.emptyTitle}>Impossible de charger vos billets</Text>
                            <Pressable
                                onPress={refetch}
                                style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
                            >
                                <Text style={styles.emptyButtonText}>Réessayer</Text>
                            </Pressable>
                        </View>
                    ) : tickets ? (
                        <View style={styles.empty}>
                            <Ionicons name="ticket-outline" size={40} color={COLORS.textMuted} />
                            <Text style={styles.emptyTitle}>
                                {tab === 'active' ? 'Aucun billet à venir' : 'Aucun billet dans l’historique'}
                            </Text>
                            {tab === 'active' && (
                                <>
                                    <Text style={styles.emptyText}>
                                        Vos billets apparaîtront ici après votre achat.
                                    </Text>
                                    <Pressable
                                        onPress={() => navigation.navigate('Events')}
                                        style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
                                    >
                                        <Text style={styles.emptyButtonText}>Découvrir les événements</Text>
                                    </Pressable>
                                </>
                            )}
                        </View>
                    ) : null
                }
            />

            <LoadingPopup visible={loading && !tickets && !loadError} message="Récupération de vos billets." />
            <ErrorPopup error={error} onClose={() => setError(null)} />
            <TicketQrModal ticket={shown} onClose={() => setShown(null)} />
        </>
    );
}

function LoggedOut() {
    const navigation = useNavigation();
    return (
        <View style={styles.loggedOut}>
            <View style={styles.loggedOutIcon}>
                <Ionicons name="ticket-outline" size={32} color={COLORS.navy} />
            </View>
            <Text style={styles.emptyTitle}>Vos billets vous attendent</Text>
            <Text style={styles.emptyText}>Connectez-vous pour retrouver vos achats et vos billets.</Text>
            <Pressable
                onPress={() => navigation.navigate('Profile')}
                style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
            >
                <Text style={styles.emptyButtonText}>Se connecter</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 120,
    },
    gap: { height: 12 },

    header: { marginBottom: 12 },
    title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: 14, color: COLORS.navyLight, opacity: 0.75, marginTop: 4 },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 18 },

    tabs: { flexDirection: 'row', gap: 8 },
    tab: {
        flex: 1,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.bar,
    },
    tabActive: { backgroundColor: COLORS.navy },
    tabText: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    tabTextActive: { color: COLORS.white },

    section: { fontSize: 15, fontWeight: '700', color: COLORS.navyLight, opacity: 0.8, marginTop: 18 },

    empty: { alignItems: 'center', gap: 8, paddingVertical: 32, paddingHorizontal: 24 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
    emptyText: { fontSize: 14, lineHeight: 20, color: COLORS.navyLight, textAlign: 'center' },
    emptyButton: {
        marginTop: 10,
        height: 46,
        paddingHorizontal: 22,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.navy,
    },
    emptyButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },

    loggedOut: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 32,
        paddingBottom: 100,
    },
    loggedOutIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        marginBottom: 8,
    },
    pressed: { opacity: 0.8 },
});
