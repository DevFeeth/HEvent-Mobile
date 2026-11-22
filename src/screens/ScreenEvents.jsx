import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import OptionSheet from '../components/OptionSheet';
import UpcomingEventCard from '../components/UpcomingEventCard';
import { COLORS } from '../constants/colors';
import useCategories from '../hooks/useCategories';
import useFetch from '../hooks/useFetch';
import useStoreLoader from '../hooks/useStoreLoader';
import useUserLocation from '../hooks/useUserLocation';
import { getDrivingDistances } from '../services/distanceService';
import { getEvents } from '../services/eventService';
import { selectEvents, setEvents } from '../store/eventsSlice';
import { eventCoords } from '../utils/eventCoords';

const DATE_OPTIONS = [
    { value: 'ALL', label: 'Toutes les dates', short: 'Toutes' },
    { value: 'TODAY', label: "Aujourd'hui", short: "Aujourd'hui" },
    { value: 'WEEK', label: '7 prochains jours', short: '7 jours' },
    { value: 'MONTH', label: '30 prochains jours', short: '30 jours' },
];
const DAYS_AHEAD = { TODAY: 0, WEEK: 7, MONTH: 30 };

const DISTANCE_OPTIONS = [
    { value: null, label: 'Toutes distances', short: 'Toutes' },
    ...[5, 10, 25, 50, 100].map((km) => ({ value: km, label: `≤ ${km} km`, short: `≤ ${km} km` })),
];

const normalize = (text) =>
    (text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const asList = (data) => (Array.isArray(data) ? data : (data?.data ?? []));

function matchesDate(event, preset) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(event.end_date) < today) return false;
    if (preset === 'ALL') return true;

    const limit = new Date(today);
    limit.setDate(limit.getDate() + DAYS_AHEAD[preset] + 1);
    return new Date(event.start_date) < limit;
}

// Google limite le nombre de destinations par appel (25)
async function distancesFor(origin, events) {
    const result = {};
    for (let i = 0; i < events.length; i += 25) {
        const chunk = events.slice(i, i + 25);
        const km = await getDrivingDistances(origin, chunk.map(eventCoords));
        chunk.forEach((event, index) => {
            result[event.id] = km[index];
        });
    }
    return result;
}

export default function ScreenEvents() {
    const userLocation = useUserLocation();
    const navigation = useNavigation();

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('ALL');
    const [datePreset, setDatePreset] = useState('ALL');
    const [maxKm, setMaxKm] = useState(null);
    const [sheet, setSheet] = useState(null); // 'date' | 'distance' | null

    const data = useSelector(selectEvents);
    const { error, loading, refetch } = useStoreLoader(getEvents, setEvents);
    const { categories } = useCategories();

    const events = useMemo(
        () => asList(data).filter((e) => !e.status || e.status === 'PUBLISHED'),
        [data]
    );
    const labels = useMemo(
        () => Object.fromEntries(categories.map((c) => [c.name, c.label])),
        [categories]
    );

    const located = useMemo(() => events.filter((e) => eventCoords(e)), [events]);
    const { data: distances } = useFetch(
        () =>
            userLocation && located.length
                ? distancesFor(userLocation, located)
                : Promise.resolve({}),
        [userLocation?.latitude, userLocation?.longitude, located.map((e) => e.id).join(',')]
    );

    const results = useMemo(() => {
        const query = normalize(search.trim());
        return events
            .filter((e) => !query || normalize(e.name).includes(query))
            .filter((e) => category === 'ALL' || e.category_name === category)
            .filter((e) => matchesDate(e, datePreset))
            .filter((e) => maxKm == null || (distances?.[e.id] != null && distances[e.id] <= maxKm))
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    }, [events, search, category, datePreset, maxKm, distances]);

    const activeFilters = [category !== 'ALL', datePreset !== 'ALL', maxKm != null].filter(Boolean).length;

    const reset = () => {
        setSearch('');
        setCategory('ALL');
        setDatePreset('ALL');
        setMaxKm(null);
    };

    const dateShort = DATE_OPTIONS.find((o) => o.value === datePreset).short;
    const distanceShort = DISTANCE_OPTIONS.find((o) => o.value === maxKm).short;

    const header = (
        <View>
            <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={22} color={COLORS.navy} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Nom de l'événement..."
                    placeholderTextColor={COLORS.textMuted}
                    value={search}
                    onChangeText={setSearch}
                    returnKeyType="search"
                    maxLength={100}
                />
            </View>

            <View style={styles.refineRow}>
                <Text style={styles.refineTitle}>Affiner la recherche</Text>
                <Pressable onPress={reset} hitSlop={8}>
                    <Text style={styles.resetText}>Réinitialiser</Text>
                </Pressable>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
            >
                {[{ name: 'ALL', label: 'Tous' }, ...categories].map((c) => {
                    const active = c.name === category;
                    return (
                        <Pressable
                            key={c.name}
                            onPress={() => setCategory(c.name)}
                            style={[styles.chip, active && styles.chipActive]}
                        >
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            <View style={styles.filters}>
                <FilterButton icon="calendar-outline" label="Date" value={dateShort} onPress={() => setSheet('date')} />
                <FilterButton
                    icon="navigate-outline"
                    label="Distance"
                    value={userLocation ? distanceShort : 'Position indisponible'}
                    onPress={() => userLocation && setSheet('distance')}
                />
            </View>

            <View style={styles.countRow}>
                <Text style={styles.count}>
                    {results.length} événement{results.length > 1 ? 's' : ''}
                </Text>
                {activeFilters > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {activeFilters} filtre{activeFilters > 1 ? 's' : ''}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Text style={styles.title}>Explorer les événements</Text>

            <View style={styles.panel}>
                <FlatList
                    data={results}
                    keyExtractor={(item) => String(item.id)}
                    ListHeaderComponent={header}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    renderItem={({ item }) => (
                        <UpcomingEventCard
                            event={item}
                            categoryLabel={labels[item.category_name] ?? item.category_name}
                            userLocation={userLocation}
                            distance={distances?.[item.id] ?? null}
                            onPress={() =>
                                navigation.navigate('EventDetail', {
                                    event: item,
                                    categoryLabel: labels[item.category_name] ?? item.category_name,
                                    distance: distances?.[item.id] ?? null,
                                })
                            }
                        />
                    )}
                    ListEmptyComponent={
                        loading ? (
                            <ActivityIndicator color={COLORS.navy} style={styles.state} />
                        ) : error ? (
                            <View style={styles.state}>
                                <Text style={styles.stateText}>Impossible de charger les événements.</Text>
                                <Pressable onPress={refetch} style={styles.retry}>
                                    <Text style={styles.retryText}>Réessayer</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <Text style={[styles.state, styles.stateText]}>
                                Aucun événement ne correspond à ta recherche.
                            </Text>
                        )
                    }
                    refreshControl={
                        <RefreshControl refreshing={loading && data != null} onRefresh={refetch} />
                    }
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                />
            </View>

            <OptionSheet
                visible={sheet === 'date'}
                title="Date"
                options={DATE_OPTIONS}
                selected={datePreset}
                onSelect={setDatePreset}
                onClose={() => setSheet(null)}
            />
            <OptionSheet
                visible={sheet === 'distance'}
                title="Distance"
                options={DISTANCE_OPTIONS}
                selected={maxKm}
                onSelect={setMaxKm}
                onClose={() => setSheet(null)}
            />
        </SafeAreaView>
    );
}

function FilterButton({ icon, label, value, onPress }) {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}>
            <View style={styles.filterIcon}>
                <Ionicons name={icon} size={18} color={COLORS.navy} />
            </View>
            <View style={styles.filterText}>
                <Text style={styles.filterLabel}>{label}</Text>
                <Text style={styles.filterValue} numberOfLines={1}>
                    {value}
                </Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={COLORS.navyLight} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.navy },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.white,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 26,
    },
    panel: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
    },
    content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 130 },
    separator: { height: 12 },

    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 52,
        paddingHorizontal: 16,
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 18,
    },
    searchInput: { flex: 1, fontSize: 16, color: COLORS.text },

    refineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 18,
        marginBottom: 12,
    },
    refineTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
    resetText: { fontSize: 14, fontWeight: '700', color: COLORS.text },

    chips: { gap: 10, paddingBottom: 14 },
    chip: {
        paddingHorizontal: 18,
        height: 42,
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 21,
    },
    chipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
    chipText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    chipTextActive: { color: COLORS.white },

    filters: { flexDirection: 'row', gap: 12 },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 18,
    },
    filterIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    filterText: { flex: 1 },
    filterLabel: { fontSize: 11, fontWeight: '600', color: COLORS.navyLight, opacity: 0.7, textTransform: 'uppercase' },
    filterValue: { fontSize: 14, fontWeight: '700', color: COLORS.text },

    countRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 20,
        marginBottom: 12,
    },
    count: { fontSize: 17, fontWeight: '700', color: COLORS.text },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        backgroundColor: '#dcefe6',
        borderRadius: 12,
    },
    badgeText: { fontSize: 12, fontWeight: '700', color: '#1d6b4a' },

    state: { marginTop: 32, alignItems: 'center' },
    stateText: { textAlign: 'center', fontSize: 15, color: COLORS.navyLight },
    retry: {
        marginTop: 12,
        paddingHorizontal: 20,
        height: 44,
        justifyContent: 'center',
        backgroundColor: COLORS.navy,
        borderRadius: 14,
    },
    retryText: { color: COLORS.white, fontWeight: '700' },
    pressed: { opacity: 0.8 },
});