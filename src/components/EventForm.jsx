import {
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

import Field from './Field';
import { COLORS } from '../constants/colors';
import { CREATE_EVENT_STATUSES, EVENT_STATUSES } from '../constants/eventStatus';
import useFetch from '../hooks/useFetch';
import { getCategories } from '../services/categoryService';
import { maskDateInput, maskTimeInput } from '../utils/formatDateTime';
import { EVENT_LIMITS } from '../utils/validators/eventValidators';

export default function EventForm({
    mode,
    form,
    update,
    errors,
    title,
    subtitle,
    banner,
    children,
    submitLabel,
    cancelLabel = 'Annuler',
    submitting,
    onSubmit,
    onCancel,
}) {
    const { data: categories } = useFetch(getCategories);
    const statuses = mode === 'create' ? CREATE_EVENT_STATUSES : EVENT_STATUSES;

    const imageUrl = form.image_url.trim();
    const showPreview = /^https?:\/\//i.test(imageUrl) && !errors.image_url;

    return (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Pressable
                onPress={onCancel}
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
                {banner}

                {/* Informations générales */}
                <View style={styles.card}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                    <View style={styles.separator} />

                    <Field
                        label="Nom"
                        icon="pricetag-outline"
                        placeholder="Nom de l’événement"
                        value={form.name}
                        onChangeText={update('name')}
                        error={errors.name}
                        maxLength={EVENT_LIMITS.eventName}
                    />
                    <Field
                        label="Description"
                        icon="document-text-outline"
                        placeholder="Présentez votre événement"
                        value={form.description}
                        onChangeText={update('description')}
                        error={errors.description}
                        maxLength={EVENT_LIMITS.description}
                        multiline
                    />
                    <Text style={styles.counter}>
                        {form.description.length}/{EVENT_LIMITS.description}
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
                    {errors.category_name && <Text style={styles.fieldError}>{errors.category_name}</Text>}

                    <Text style={styles.label}>Statut</Text>
                    <View style={styles.chips}>
                        {statuses.map((s) => (
                            <Chip
                                key={s.value}
                                label={s.label}
                                selected={form.status === s.value}
                                onPress={() => update('status')(s.value)}
                            />
                        ))}
                    </View>
                    {errors.status && <Text style={styles.fieldError}>{errors.status}</Text>}
                </View>

                {/* Dates */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Dates et horaires</Text>
                    <DateTimeRow
                        dateLabel="Date de début"
                        date={form.start_date}
                        time={form.start_time}
                        onChangeDate={update('start_date', maskDateInput)}
                        onChangeTime={update('start_time', maskTimeInput)}
                        dateError={errors.start_date}
                        timeError={errors.start_time}
                    />
                    <DateTimeRow
                        dateLabel="Date de fin"
                        date={form.end_date}
                        time={form.end_time}
                        onChangeDate={update('end_date', maskDateInput)}
                        onChangeTime={update('end_time', maskTimeInput)}
                        dateError={errors.end_date}
                        timeError={errors.end_time}
                    />
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
                        error={errors.image_url}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                    />
                    {showPreview && <Image source={{ uri: imageUrl }} style={styles.preview} resizeMode="cover" />}
                </View>

                {children}

                <Pressable
                    onPress={onSubmit}
                    disabled={submitting}
                    style={({ pressed }) => [styles.primaryButton, (pressed || submitting) && styles.pressed]}
                >
                    <Text style={styles.primaryButtonText}>{submitLabel}</Text>
                </Pressable>
                <Pressable
                    onPress={onCancel}
                    style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                >
                    <Text style={styles.secondaryButtonText}>{cancelLabel}</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function DateTimeRow({ dateLabel, date, time, onChangeDate, onChangeTime, dateError, timeError }) {
    return (
        <View style={styles.twoCols}>
            <View style={styles.col}>
                <Field
                    label={dateLabel}
                    icon="calendar-outline"
                    placeholder="JJ/MM/AAAA"
                    value={date}
                    onChangeText={onChangeDate}
                    error={dateError}
                    keyboardType="number-pad"
                    maxLength={10}
                />
            </View>
            <View style={styles.colSmall}>
                <Field
                    label="Heure"
                    icon="time-outline"
                    placeholder="HH:MM"
                    value={time}
                    onChangeText={onChangeTime}
                    error={timeError}
                    keyboardType="number-pad"
                    maxLength={5}
                />
            </View>
        </View>
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

export function EventFormCard({ title, children }) {
    return (
        <View style={styles.card}>
            {!!title && <Text style={styles.sectionTitle}>{title}</Text>}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
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
