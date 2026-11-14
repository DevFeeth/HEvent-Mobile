import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import ErrorPopup from '../components/ErrorPopup';
import LoadingPopup from '../components/LoadingPopup';
import UpcomingEventCard from '../components/UpcomingEventCard';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import useUserLocation from '../hooks/useUserLocation';
import { getCategories } from '../services/categoryService';
import { getDrivingDistances } from '../services/distanceService';
import { getUpcomingEvents } from '../services/eventService';
import { eventCoords } from '../utils/eventCoords';

export default function ScreenHome() {
    const { user } = useAuth();
    const { data: events, loading, error, refetch } = useFetch(getUpcomingEvents);
    const { data: categories } = useFetch(getCategories);
    const userLocation = useUserLocation();

    // Un seul appel Google pour tous les événements qui ont des coordonnées
    const located = (events ?? []).filter(eventCoords);
    const { data: distances, error: distanceError } = useFetch(
        () =>
            userLocation && located.length
                ? getDrivingDistances(userLocation, located.map(eventCoords))
                : Promise.resolve(null),
        [userLocation?.latitude, userLocation?.longitude, located.map((e) => [e.id, e.latitude, e.longitude])]
    );
    const distanceOf = (event) => distances?.[located.indexOf(event)];

    useEffect(() => {
        if (distanceError) console.warn('Distances indisponibles :', distanceError.message);
    }, [distanceError]);

    const [dismissedError, setDismissedError] = useState(null);

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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading && !!events} onRefresh={refetch} tintColor={COLORS.navy} />
                }
            >
                <LinearGradient
                    colors={[COLORS.navy, COLORS.navyLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.welcomeCard}
                >
                    <Text style={styles.welcomeTitle} numberOfLines={2}>
                        {user?.first_name ? `Bienvenue ${user.first_name}` : 'Bienvenue'}
                    </Text>
                    <Text style={styles.welcomeText}>
                        Découvrez les événements les plus proches et préparez votre prochaine sortie.
                    </Text>
                </LinearGradient>

                <Text style={styles.sectionTitle}>Prochainement</Text>

                <View style={styles.list}>
                    {(events ?? []).map((event) => (
                        <UpcomingEventCard
                            key={event.id}
                            event={event}
                            categoryLabel={categoryLabel(event.category_name)}
                            userLocation={userLocation}
                            distance={distanceOf(event)}
                        />
                    ))}
                </View>

                {!!events && events.length === 0 && (
                    <Text style={styles.empty}>Aucun événement à venir pour le moment.</Text>
                )}
            </ScrollView>

            <LoadingPopup
                visible={loading && !events && !error}
                message="Récupération des prochains événements."
            />
            <ErrorPopup
                error={error !== dismissedError ? error : null}
                onClose={() => setDismissedError(error)}
                onRetry={refetch}
            />
        </SafeAreaView>
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

    welcomeCard: {
        borderRadius: 32,
        paddingHorizontal: 20,
        paddingTop: 28,
        paddingBottom: 32,
        // Ombre iOS
        shadowColor: COLORS.navy,
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        // Ombre Android
        elevation: 8,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.white,
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 16,
        lineHeight: 24,
        color: 'rgba(255, 255, 255, 0.8)',
    },

    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 28,
        marginBottom: 16,
    },
    list: {
        gap: 12,
    },
    empty: {
        textAlign: 'center',
        fontSize: 15,
        color: COLORS.navyLight,
        marginVertical: 24,
    },
});
