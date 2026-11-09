import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import ConfirmPopup from '../components/ConfirmPopup';
import ErrorPopup from '../components/ErrorPopup';
import LoadingPopup from '../components/LoadingPopup';
import OrganizerEventCard from '../components/OrganizerEventCard';
import { COLORS } from '../constants/colors';
import useFetch from '../hooks/useFetch';
import { getCategories } from '../services/categoryService';
import { deleteEvent } from '../services/eventService';
import { getMyEvents } from '../services/userService';

const DELETE_MESSAGES = {
    409: {
        title: 'Suppression impossible',
        message: 'Des billets ont déjà été vendus pour cet événement, il ne peut pas être supprimé.',
    },
};

export default function ScreenOrganizer() {
    const navigation = useNavigation();
    const { data: events, loading, error: loadError, refetch } = useFetch(getMyEvents);
    const { data: categories } = useFetch(getCategories);
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
    const [deleting, setDeleting] = useState(false);
    const [toDelete, setToDelete] = useState(null);

    const confirmDelete = (event) => setToDelete(event);

    const remove = async (event) => {
        setDeleting(true);
        try {
            await deleteEvent(event.id);
            await refetch();
        } catch (err) {
            setError(err);
        } finally {
            setDeleting(false);
        }
    };

    const count = events?.length ?? 0;

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={events ?? []}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.gap} />}
                ListHeaderComponent={
                    <>
                        <LinearGradient
                            colors={[COLORS.navy, COLORS.navyLight]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.header}
                        >
                            <Pressable
                                onPress={() => navigation.goBack()}
                                hitSlop={10}
                                style={({ pressed }) => [styles.back, pressed && styles.pressed]}
                            >
                                <Ionicons name="chevron-back" size={14} color={COLORS.white} />
                                <Text style={styles.backText}>Mon profil</Text>
                            </Pressable>
                            <Text style={styles.title}>Espace Organisateur</Text>
                            <Text style={styles.subtitle}>
                                Retrouvez et gérez les événements que vous promouvez.
                            </Text>
                        </LinearGradient>

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Mes événements</Text>
                            {!!events && (
                                <View style={styles.countChip}>
                                    <Text style={styles.countText}>
                                        {count} événement{count > 1 ? 's' : ''}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </>
                }
                renderItem={({ item }) => (
                    <OrganizerEventCard
                        event={item}
                        categoryLabel={categoryLabel(item.category_name)}
                        onScan={() => navigation.navigate('ScanQr', { event: { id: item.id, name: item.name } })}
                        onEdit={() => navigation.navigate('EditEvent', { event: item })}
                        onDelete={() => confirmDelete(item)}
                    />
                )}
                ListEmptyComponent={
                    !loading && !loadError ? (
                        <Text style={styles.empty}>Vous n’avez pas encore créé d’événement.</Text>
                    ) : null
                }
                ListFooterComponent={
                    <>
                        {count > 0 && (
                            <View style={styles.note}>
                                <Ionicons name="information-circle-outline" size={16} color={COLORS.navyLight} />
                                <Text style={styles.noteText}>
                                    Les modifications sont visibles sur la fiche de l’événement.
                                </Text>
                            </View>
                        )}
                        <Pressable
                            onPress={() => navigation.navigate('CreateEvent')}
                            style={({ pressed }) => [styles.create, pressed && styles.pressed]}
                        >
                            <Ionicons name="add" size={20} color={COLORS.white} />
                            <Text style={styles.createText}>Créer un événement</Text>
                        </Pressable>
                    </>
                }
            />

            <LoadingPopup
                visible={(loading && !events) || deleting}
                title={deleting ? 'Suppression...' : 'Chargement...'}
                message={deleting ? 'Suppression de l’événement en cours.' : 'Récupération de vos événements.'}
            />
            <ErrorPopup error={loadError} onClose={() => navigation.goBack()} onRetry={refetch} />
            <ErrorPopup error={error} onClose={() => setError(null)} messages={DELETE_MESSAGES} />

            <ConfirmPopup
                visible={!!toDelete}
                title="Supprimer l’événement ?"
                message={`Voulez-vous vraiment supprimer « ${toDelete?.name ?? ''} » ? Cette action est définitive.`}
                confirmLabel="Supprimer"
                destructive
                onConfirm={() => {
                    const event = toDelete;
                    setToDelete(null);
                    remove(event);
                }}
                onCancel={() => setToDelete(null)}
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
    gap: {
        height: 12,
    },

    header: {
        borderRadius: 24,
        padding: 18,
        gap: 6,

        shadowColor: COLORS.navy,
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },

        elevation: 8,
    },
    back: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 2,
    },
    backText: {
        color: COLORS.white,
        fontSize: 13,
        opacity: 0.85,
    },
    title: {
        color: COLORS.white,
        fontSize: 26,
        fontWeight: '700',
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        lineHeight: 20,
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 22,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },
    countChip: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    countText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text,
    },
    empty: {
        textAlign: 'center',
        fontSize: 15,
        color: COLORS.navyLight,
        marginVertical: 24,
    },

    note: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 16,
    },
    noteText: {
        fontSize: 12,
        color: COLORS.navyLight,
        opacity: 0.8,
    },
    create: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        gap: 8,
        height: 52,
        paddingHorizontal: 24,
        borderRadius: 16,
        backgroundColor: COLORS.navy,
        marginTop: 20,
    },
    createText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    pressed: {
        opacity: 0.75,
    },
});
