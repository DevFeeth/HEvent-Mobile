import { useState } from 'react';
import {
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
import { useNavigation } from '@react-navigation/native';

import ErrorPopup from '../components/ErrorPopup';
import Field from '../components/Field';
import LoadingPopup from '../components/LoadingPopup';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../utils/ApiError';
import { LIMITS, PROFILE_RULES, validateForm } from '../utils/validators';

const MESSAGES = {
    409: { title: 'E-mail déjà utilisé', message: 'Un autre compte utilise déjà cette adresse e-mail.' },
};

export default function ScreenEditProfile() {
    const navigation = useNavigation();
    const { user, updateProfile } = useAuth();

    const [form, setForm] = useState({
        last_name: user.last_name ?? '',
        first_name: user.first_name ?? '',
        email: user.email ?? '',
        address: user.address ?? '',
        postal_code: user.postal_code ? String(user.postal_code) : '',
        city: user.city ?? '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const update = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

    const submit = async () => {
        const errors = validateForm(form, PROFILE_RULES);
        setFieldErrors(errors);
        setError(null);
        if (Object.keys(errors).length) return;

        setSubmitting(true);
        try {
            await updateProfile({
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                address: form.address.trim(),
                postal_code: form.postal_code.trim(),
                city: form.city.trim(),
            });
            navigation.goBack();
        } catch (err) {
            setError(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Pressable
                    onPress={() => navigation.goBack()}
                    hitSlop={8}
                    style={({ pressed }) => [styles.back, pressed && styles.pressed]}
                >
                    <Ionicons name="arrow-back" size={22} color={COLORS.navy} />
                    <Text style={styles.backText}>Mon compte</Text>
                </Pressable>

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>
                        <Text style={styles.title}>Modifier mon compte</Text>
                        <Text style={styles.subtitle}>
                            Mets à jour tes informations personnelles et ton adresse.
                        </Text>
                        <View style={styles.separator} />

                        <Field
                            label="Nom"
                            icon="person-outline"
                            placeholder="Nom"
                            value={form.last_name}
                            onChangeText={update('last_name')}
                            error={fieldErrors.last_name}
                            autoComplete="family-name"
                            maxLength={LIMITS.name}
                        />
                        <Field
                            label="Prénom"
                            icon="person-outline"
                            placeholder="Prénom"
                            value={form.first_name}
                            onChangeText={update('first_name')}
                            error={fieldErrors.first_name}
                            autoComplete="given-name"
                            maxLength={LIMITS.name}
                        />
                        <Field
                            label="Adresse e-mail"
                            icon="mail-outline"
                            value={form.email}
                            disabled
                        />
                        <Field
                            label="Rue"
                            icon="location-outline"
                            placeholder="Numéro et rue"
                            value={form.address}
                            onChangeText={update('address')}
                            autoComplete="street-address"
                            maxLength={LIMITS.address}
                        />

                        <View style={styles.twoCols}>
                            <View style={styles.col}>
                                <Field
                                    label="Code postal"
                                    icon="location-outline"
                                    placeholder="À compléter"
                                    value={form.postal_code}
                                    onChangeText={update('postal_code')}
                                    error={fieldErrors.postal_code}
                                    keyboardType="number-pad"
                                    autoComplete="postal-code"
                                    maxLength={LIMITS.postalCode}
                                />
                            </View>
                            <View style={styles.col}>
                                <Field
                                    label="Ville"
                                    icon="location-outline"
                                    placeholder="Ville"
                                    value={form.city}
                                    onChangeText={update('city')}
                                    maxLength={LIMITS.city}
                                />
                            </View>
                        </View>

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
                    </View>

                    <Pressable
                        onPress={() => navigation.goBack()}
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
                onRetry={error instanceof ApiError ? submit : undefined}
                messages={MESSAGES}
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
    flex: { flex: 1 },
    content: { paddingTop: 12, paddingBottom: 120 },

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

    twoCols: { flexDirection: 'row', gap: 12 },
    col: { flex: 1 },

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
        marginTop: 14,
    },
    secondaryButtonText: { fontSize: 17, fontWeight: '700', color: COLORS.text },
    pressed: { opacity: 0.8 },
});