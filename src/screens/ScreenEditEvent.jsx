import { useMemo, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import ErrorPopup from '../components/ErrorPopup';
import Field from '../components/Field';
import LoadingPopup from '../components/LoadingPopup';
import TicketTypeSection from '../components/TicketTypeSection';
import { COLORS } from '../constants/colors';
import useFetch from '../hooks/useFetch';
import { getCategories } from '../services/categoryService';
import { updateEvent } from '../services/eventService';
import { ApiError } from '../utils/ApiError';
import {
    dateInputToApi,
    isoToDateInput,
    isoToTimeInput,
    maskDateInput,
    maskTimeInput,
} from '../utils/formatDateTime';
import { LIMITS, validateEventForm } from '../utils/validators';

const STATUSES = [
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'PUBLISHED', label: 'Publié' },
    { value: 'CANCELLED', label: 'Annulé' },
    { value: 'FINISHED', label: 'Terminé' },
];

const REFUSALS = {
    'An event with tickets sold cannot go back to draft': {
        title: 'Brouillon impossible',
        message: 'Des billets ont déjà été vendus, l’événement ne peut pas repasser en brouillon.',
    },
    'The dates of an event cannot be in the past': {
        title: 'Dates invalides',
        message: 'Les dates de l’événement ne peuvent pas être dans le passé.',
    },
};

const MESSAGES = {
    403: { title: 'Accès refusé', message: 'Vous ne pouvez modifier que vos propres événements.' },
    404: { title: 'Introuvable', message: 'Cet événement n’existe plus.' },
};

const toForm = (event) => ({
    name: event.name ?? '',
    description: event.description ?? '',
    image_url: event.image_url ?? '',
    category_name: event.category_name ?? '',
    status: event.status ?? 'DRAFT',
    start_date: isoToDateInput(event.start_date),
    start_time: isoToTimeInput(event.start_time),
    end_date: isoToDateInput(event.end_date),
    end_time: isoToTimeInput(event.end_time),
});

const TO_API = {
    name: (v) => v.trim(),
    description: (v) => v.trim(),
    image_url: (v) => v.trim(),
    category_name: (v) => v,
    status: (v) => v,
    start_date: dateInputToApi,
    start_time: (v) => v,
    end_date: dateInputToApi,
    end_time: (v) => v,
};

export default function ScreenEditEvent() {
    const navigation = useNavigation();
    const { params } = useRoute();
    const event = params.event;

    const initial = useMemo(() => toForm(event), [event]);
    const [form, setForm] = useState(initial);
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { data: categories } = useFetch(getCategories);

    const update = (field, mask) => (value) =>
        setForm((f) => ({ ...f, [field]: mask ? mask(value) : value }));

    const changed = Object.fromEntries(
        Object.keys(TO_API)
            .filter((field) => form[field].trim() !== initial[field].trim())
            .map((field) => [field, true])
    );
    const hasChanges = Object.keys(changed).length > 0;

    const validate = () => {
        const errors = validateEventForm(form, changed);
        if (initial.image_url && !form.image_url.trim()) {
            errors.image_url = 'L’image ne peut pas être retirée, remplacez le lien';
        }
        return errors;
    };

    const save = async () => {
        setSubmitting(true);
        try {
            const changes = Object.fromEntries(
                Object.keys(changed).map((field) => [field, TO_API[field](form[field])])
            );
            await updateEvent(event.id, changes);
            navigation.goBack();
        } catch (err) {
            const refusal = err instanceof ApiError ? REFUSALS[err.message] : null;
            setError(refusal ?? err);
        } finally {
            setSubmitting(false);
        }
    };

    const submit = () => {
        const errors = validate();
        setFieldErrors(errors);
        setError(null);
        if (Object.keys(errors).length) return;
        if (!hasChanges) {
            navigation.goBack();
            return;
        }
        if (changed.status && form.status === 'CANCELLED') {
            Alert.alert(
                'Annuler l’événement',
                `« ${form.name.trim()} » sera affiché comme annulé aux participants.`,
                [
                    { text: 'Retour', style: 'cancel' },
                    { text: 'Confirmer', style: 'destructive', onPress: save },
                ]
            );
            return;
        }
        save();
    };

    const confirmLeave = () => {
        if (!hasChanges) {
            navigation.goBack();
            return;
        }
        Alert.alert('Quitter sans enregistrer ?', 'Vos modifications seront perdues.', [
            { text: 'Rester', style: 'cancel' },
            { text: 'Quitter', style: 'destructive', onPress: () => navigation.goBack() },
        ]);
    };

    const imageUrl = form.image_url.trim();
    const showPreview = /^https?:\/\//i.test(imageUrl) && !fieldErrors.image_url;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Pressable
                    onPress={confirmLeave}
                    hitSlop={8}
                    style={({ pressed }) => [styles.back, pressed && styles.pressed]}
                >
                    <Ionicons name="arrow-back" size={22} color={COLORS.navy} />
                    <Text style={styles.backText}>Espace Organisateur</Text>
                </Pressable>

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Informations générales */}
                    <View style={styles.card}>
                        <Text style={styles.title}>Modifier l’événement</Text>
                        <Text style={styles.subtitle}>
                            Les changements sont visibles immédiatement sur la fiche de l’événement.
                        </Text>
                        <View style={styles.separator} />

                        <Field
                            label="Nom"
                            icon="pricetag-outline"
                            placeholder="Nom de l’événement"
                            value={form.name}
                            onChangeText={update('name')}
                            error={fieldErrors.name}
                            maxLength={LIMITS.eventName}
                        />
                        <Field
                            label="Description"
                            icon="document-text-outline"
                            placeholder="Présentez votre événement"
                            value={form.description}
                            onChangeText={update('description')}
                            error={fieldErrors.description}
                            maxLength={LIMITS.description}
                            multiline
                        />
                        <Text style={styles.counter}>
                            {form.description.length}/{LIMITS.description}
                        </Text>

                        <Text style={styles.label}>Catégorie</Text>
                        <View style={styles.chips}>
                            {(categories ?? []).map((c) => (
                                <Chip
                                    key={c.name}
                                    label={c.label}
                                    selected={form.category_name === c.name}
                                    onPress={() => update('category_name')(c.name)}
                                />
                            ))}
                        </View>
                        {fieldErrors.category_name && (
                            <Text style={styles.fieldError}>{fieldErrors.category_name}</Text>
                        )}

                        <Text style={styles.label}>Statut</Text>
                        <View style={styles.chips}>
                            {STATUSES.map((s) => (
                                <Chip
                                    key={s.value}
                                    label={s.label}
                                    selected={form.status === s.value}
                                    onPress={() => update('status')(s.value)}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Dates */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Dates et horaires</Text>
                        <View style={styles.twoCols}>
                            <View style={styles.col}>
                                <Field
                                    label="Date de début"
                                    icon="calendar-outline"
                                    placeholder="JJ/MM/AAAA"
                                    value={form.start_date}
                                    onChangeText={update('start_date', maskDateInput)}
                                    error={fieldErrors.start_date}
                                    keyboardType="number-pad"
                                    maxLength={10}
                                />
                            </View>
                            <View style={styles.colSmall}>
                                <Field
                                    label="Heure"
                                    icon="time-outline"
                                    placeholder="HH:MM"
                                    value={form.start_time}
                                    onChangeText={update('start_time', maskTimeInput)}
                                    error={fieldErrors.start_time}
                                    keyboardType="number-pad"
                                    maxLength={5}
                                />
                            </View>
                        </View>
                        <View style={styles.twoCols}>
                            <View style={styles.col}>
                                <Field
                                    label="Date de fin"
                                    icon="calendar-outline"
                                    placeholder="JJ/MM/AAAA"
                                    value={form.end_date}
                                    onChangeText={update('end_date', maskDateInput)}
                                    error={fieldErrors.end_date}
                                    keyboardType="number-pad"
                                    maxLength={10}
                                />
                            </View>
                            <View style={styles.colSmall}>
                                <Field
                                    label="Heure"
                                    icon="time-outline"
                                    placeholder="HH:MM"
                                    value={form.end_time}
                                    onChangeText={update('end_time', maskTimeInput)}
                                    error={fieldErrors.end_time}
                                    keyboardType="number-pad"
                                    maxLength={5}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Visuel */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Visuel</Text>
                        <Field
                            label="Image (lien)"
                            icon="image-outline"
                            placeholder="https://..."
                            value={form.image_url}
                            onChangeText={update('image_url')}
                            error={fieldErrors.image_url}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="url"
                        />
                        {showPreview && (
                            <Image source={{ uri: imageUrl }} style={styles.preview} resizeMode="cover" />
                        )}
                    </View>

                    <TicketTypeSection event={event} />

                    <Pressable
                        onPress={submit}
                        disabled={submitting}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            (pressed || submitting) && styles.pressed,
                        ]}
                    >
                        <Text style={styles.primaryButtonText}>Enregistrer les modifications</Text>
                    </Pressable>
                    <Pressable
                        onPress={confirmLeave}
                        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.secondaryButtonText}>Annuler</Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>

            <LoadingPopup visible={submitting} title="Enregistrement..." />

            <ErrorPopup
                error={error}
                onClose={() => setError(null)}
                onRetry={error instanceof ApiError && error.status === 0 ? save : undefined}
                messages={MESSAGES}
            />
        </SafeAreaView>
    );
}

function Chip({ label, selected, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}
        >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
    },
    flex: { flex: 1 },
    content: { paddingTop: 12, paddingBottom: 120, gap: 14 },

    back: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingTop: 8,
    },
    backText: { fontSize: 16, fontWeight: '700', color: COLORS.navy },

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
    title: { fontSize: 26, fontWeight: '700', color: COLORS.text },
    subtitle: {
        fontSize: 15,
        color: COLORS.navyLight,
        opacity: 0.7,
        marginTop: 4,
        lineHeight: 21,
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.border,
        marginTop: 14,
        marginBottom: 18,
    },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
    label: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
    counter: {
        alignSelf: 'flex-end',
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: -10,
        marginBottom: 12,
    },
    fieldError: { color: COLORS.error, fontSize: 13, marginTop: -8, marginBottom: 12 },

    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    chipSelected: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
    chipText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    chipTextSelected: { color: COLORS.white },

    twoCols: { flexDirection: 'row', gap: 12 },
    col: { flex: 3 },
    colSmall: { flex: 2 },

    preview: {
        height: 160,
        borderRadius: 18,
        backgroundColor: COLORS.background,
    },

    primaryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        backgroundColor: COLORS.navy,
        borderRadius: 16,
        marginTop: 4,
    },
    primaryButtonText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },

    secondaryButton: {
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 16,
    },
    secondaryButtonText: { fontSize: 17, fontWeight: '700', color: COLORS.text },
    pressed: { opacity: 0.8 },
});
