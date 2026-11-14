import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import ConfirmPopup from '../components/ConfirmPopup';
import ErrorPopup from '../components/ErrorPopup';
import EventForm from '../components/EventForm';
import LoadingPopup from '../components/LoadingPopup';
import TicketTypeSection from '../components/TicketTypeSection';
import { COLORS } from '../constants/colors';
import useEventForm, { toEventError } from '../hooks/useEventForm';
import useUnsavedChangesGuard from '../hooks/useUnsavedChangesGuard';
import { updateEvent } from '../services/eventService';
import { ApiError } from '../utils/ApiError';

const MESSAGES = {
    403: { title: 'Accès refusé', message: 'Vous ne pouvez modifier que vos propres événements.' },
    404: { title: 'Introuvable', message: 'Cet événement n’existe plus.' },
};

// Modification d'un événement et de ses types de billets.
// params.justCreated : on arrive juste après la création (ScreenCreateEvent)
export default function ScreenEditEvent() {
    const navigation = useNavigation();
    const { params } = useRoute();
    const { event, justCreated } = params;

    const eventForm = useEventForm(event);
    const { form, changed, hasChanges } = eventForm;
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [confirmCancelEvent, setConfirmCancelEvent] = useState(false);
    const { leaveWithoutPrompt, popupProps: leavePopup } = useUnsavedChangesGuard(hasChanges);

    const save = async () => {
        setSubmitting(true);
        try {
            await updateEvent(event.id, eventForm.toChanges());
            leaveWithoutPrompt();
        } catch (err) {
            setError(toEventError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const submit = () => {
        setError(null);
        if (!eventForm.validate()) return;
        if (!hasChanges) {
            navigation.goBack();
            return;
        }
        if (changed.status && form.status === 'CANCELLED') {
            setConfirmCancelEvent(true);
            return;
        }
        save();
    };

    return (
        <SafeAreaView style={styles.container}>
            <EventForm
                mode="edit"
                {...eventForm}
                title="Modifier l’événement"
                subtitle="Les changements sont visibles immédiatement sur la fiche de l’événement."
                banner={
                    justCreated && (
                        <View style={styles.successBanner}>
                            <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                            <Text style={styles.successText}>
                                Événement créé ! Ajoutez maintenant ses types de billets ci-dessous.
                            </Text>
                        </View>
                    )
                }
                submitLabel="Enregistrer les modifications"
                cancelLabel={justCreated ? 'Terminer' : 'Annuler'}
                submitting={submitting}
                onSubmit={submit}
                onCancel={() => navigation.goBack()}
            >
                <TicketTypeSection event={event} />
            </EventForm>

            <LoadingPopup visible={submitting} title="Enregistrement..." />
            <ErrorPopup
                error={error}
                onClose={() => setError(null)}
                onRetry={error instanceof ApiError && error.status === 0 ? save : undefined}
                messages={MESSAGES}
            />
            <ConfirmPopup
                {...leavePopup}
                title="Annuler les modifications ?"
                message="Les changements apportés à l’événement ne seront pas enregistrés."
                confirmLabel="Quitter sans enregistrer"
                cancelLabel="Continuer la modification"
                icon="create-outline"
                destructive
            />
            <ConfirmPopup
                visible={confirmCancelEvent}
                title="Annuler l’événement ?"
                message={`« ${form.name.trim()} » sera affiché comme annulé aux participants.`}
                confirmLabel="Oui, annuler l’événement"
                cancelLabel="Retour"
                icon="close-circle-outline"
                destructive
                onConfirm={() => {
                    setConfirmCancelEvent(false);
                    save();
                }}
                onCancel={() => setConfirmCancelEvent(false)}
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
    successBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: 18,
        backgroundColor: 'rgba(31, 164, 99, 0.1)',
    },
    successText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20, color: COLORS.success },
});
