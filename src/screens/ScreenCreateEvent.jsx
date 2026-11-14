import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import ConfirmPopup from '../components/ConfirmPopup';
import ErrorPopup from '../components/ErrorPopup';
import EventForm, { EventFormCard } from '../components/EventForm';
import LoadingPopup from '../components/LoadingPopup';
import { COLORS } from '../constants/colors';
import useEventForm, { toEventError } from '../hooks/useEventForm';
import useUnsavedChangesGuard from '../hooks/useUnsavedChangesGuard';
import { createEvent, getEventById } from '../services/eventService';
import { ApiError } from '../utils/ApiError';

export default function ScreenCreateEvent() {
    const navigation = useNavigation();
    const eventForm = useEventForm();
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { leaveWithoutPrompt, disableGuard, popupProps: leavePopup } = useUnsavedChangesGuard(
        eventForm.hasChanges
    );

    const create = async () => {
        setSubmitting(true);
        let id;
        try {
            ({ id } = await createEvent(eventForm.toPayload()));
            const created = await getEventById(id);
            disableGuard();
            navigation.replace('EditEvent', { event: created, justCreated: true });
        } catch (err) {
            if (id) {
                leaveWithoutPrompt();
                return;
            }
            setError(toEventError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const submit = () => {
        setError(null);
        if (eventForm.validate()) create();
    };

    return (
        <SafeAreaView style={styles.container}>
            <EventForm
                mode="create"
                {...eventForm}
                title="Créer un événement"
                subtitle="Renseignez les informations principales, vous ajouterez les billets juste après."
                submitLabel="Créer l’événement"
                submitting={submitting}
                onSubmit={submit}
                onCancel={() => navigation.goBack()}
            >
                <EventFormCard title="Types de billets">
                    <View style={styles.infoRow}>
                        <Ionicons name="ticket-outline" size={18} color={COLORS.navyLight} />
                        <Text style={styles.infoText}>
                            Vous pourrez ajouter les types de billets (Standard, VIP...) dès que l’événement sera
                            créé.
                        </Text>
                    </View>
                </EventFormCard>
            </EventForm>

            <LoadingPopup visible={submitting} title="Création..." />
            <ErrorPopup
                error={error}
                onClose={() => setError(null)}
                onRetry={error instanceof ApiError && error.status === 0 ? create : undefined}
            />
            <ConfirmPopup
                {...leavePopup}
                title="Abandonner la création ?"
                message="L’événement ne sera pas créé et les informations saisies seront perdues."
                confirmLabel="Quitter sans enregistrer"
                cancelLabel="Continuer la création"
                icon="create-outline"
                destructive
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoText: { flex: 1, fontSize: 14, lineHeight: 20, color: COLORS.navyLight },
});
