import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
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
import { addTicketType, updateTicketType } from '../services/ticketTypeService';
import { ApiError, getErrorContent } from '../utils/ApiError';
import { validateForm } from '../utils/validators/common';
import { EVENT_LIMITS, parsePrice, ticketTypeRules } from '../utils/validators/eventValidators';

const REFUSALS = {
    'This value is already in use': 'Un type de billet porte déjà ce nom pour cet événement.',
    'The quantity cannot be lower than the number of tickets already sold':
        'Le nombre de places ne peut pas être inférieur au nombre de billets déjà vendus.',
};

const toForm = (ticketType) => ({
    name: ticketType?.name ?? '',
    description: ticketType?.description ?? '',
    price: ticketType ? String(Number(ticketType.price)).replace('.', ',') : '',
    available_quantity: ticketType ? String(ticketType.available_quantity) : '',
});

const TO_API = {
    name: (v) => v.trim(),
    description: (v) => v.trim(),
    price: parsePrice,
    available_quantity: (v) => Number(v),
};

// sold : billets déjà vendus de ce type (la quantité ne peut pas descendre en dessous)
export default function TicketTypeSheet({ visible, eventId, ticketType, sold = 0, onClose, onSaved }) {
    const isEdit = !!ticketType;
    const [initial, setInitial] = useState(() => toForm(ticketType));
    const [form, setForm] = useState(initial);
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const [openedFor, setOpenedFor] = useState(null);
    const key = visible ? (ticketType?.id ?? 'new') : null;
    if (key !== openedFor) {
        setOpenedFor(key);
        if (visible) {
            const next = toForm(ticketType);
            setInitial(next);
            setForm(next);
            setFieldErrors({});
            setError(null);
        }
    }

    const update = (field, mask) => (value) =>
        setForm((f) => ({ ...f, [field]: mask ? mask(value) : value }));

    const submit = async () => {
        const errors = validateForm(form, ticketTypeRules(sold));
        setFieldErrors(errors);
        setError(null);
        if (Object.keys(errors).length) return;

        const fields = Object.keys(TO_API).filter(
            (field) => !isEdit || form[field].trim() !== initial[field].trim()
        );
        if (isEdit && !fields.length) {
            onClose();
            return;
        }
        const payload = Object.fromEntries(fields.map((field) => [field, TO_API[field](form[field])]));
        if (!isEdit && !payload.description) delete payload.description;

        setSaving(true);
        try {
            if (isEdit) await updateTicketType(ticketType.id, payload);
            else await addTicketType(eventId, payload);
            onSaved();
        } catch (err) {
            setError(
                (err instanceof ApiError && REFUSALS[err.message]) || getErrorContent(err).message
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={saving ? () => {} : onClose}
        >
            <KeyboardAvoidingView
                style={styles.backdrop}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={saving ? undefined : onClose} />
                <View style={styles.sheet}>
                    <View style={styles.handle} />
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {isEdit ? 'Modifier le type de billet' : 'Nouveau type de billet'}
                        </Text>
                        <Pressable onPress={onClose} disabled={saving} hitSlop={10}>
                            <Ionicons name="close" size={24} color={COLORS.navy} />
                        </Pressable>
                    </View>

                    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        <Field
                            label="Nom"
                            icon="ticket-outline"
                            placeholder="Ex. Standard, VIP..."
                            value={form.name}
                            onChangeText={update('name')}
                            error={fieldErrors.name}
                            maxLength={EVENT_LIMITS.ticketTypeName}
                        />
                        <Field
                            label="Description (facultatif)"
                            icon="document-text-outline"
                            placeholder="Ce que comprend ce billet"
                            value={form.description}
                            onChangeText={update('description')}
                            error={fieldErrors.description}
                            maxLength={EVENT_LIMITS.ticketTypeDescription}
                            multiline
                        />
                        <View style={styles.twoCols}>
                            <View style={styles.col}>
                                <Field
                                    label="Prix (€)"
                                    icon="cash-outline"
                                    placeholder="0,00"
                                    value={form.price}
                                    onChangeText={update('price', (v) => v.replace(/[^\d.,]/g, ''))}
                                    error={fieldErrors.price}
                                    keyboardType="decimal-pad"
                                    maxLength={11}
                                />
                            </View>
                            <View style={styles.col}>
                                <Field
                                    label="Nombre de places"
                                    icon="layers-outline"
                                    placeholder={sold > 0 ? `Min. ${sold}` : 'Quantité'}
                                    value={form.available_quantity}
                                    onChangeText={update('available_quantity', (v) => v.replace(/\D/g, ''))}
                                    error={fieldErrors.available_quantity}
                                    keyboardType="number-pad"
                                    maxLength={7}
                                />
                            </View>
                        </View>

                        {!!error && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={18} color={COLORS.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <Pressable
                            onPress={submit}
                            disabled={saving}
                            style={({ pressed }) => [styles.primaryButton, (pressed || saving) && styles.pressed]}
                        >
                            {saving ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.primaryButtonText}>
                                    {isEdit ? 'Enregistrer' : 'Ajouter le type de billet'}
                                </Text>
                            )}
                        </Pressable>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(3, 29, 62, 0.45)',
    },
    sheet: {
        maxHeight: '90%',
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 22,
        paddingTop: 10,
        paddingBottom: 34,
    },
    handle: {
        alignSelf: 'center',
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: COLORS.border,
        marginBottom: 14,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
    twoCols: { flexDirection: 'row', gap: 12 },
    col: { flex: 1 },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 67, 67, 0.08)',
        marginBottom: 12,
    },
    errorText: { flex: 1, fontSize: 14, color: COLORS.error },
    primaryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        backgroundColor: COLORS.navy,
        borderRadius: 16,
        marginTop: 4,
    },
    primaryButtonText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
    pressed: { opacity: 0.8 },
});
