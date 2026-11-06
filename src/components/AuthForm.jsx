import { useState } from 'react';
import {
    ActivityIndicator,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ErrorPopup from './ErrorPopup';
import LoadingPopup from './LoadingPopup';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../utils/ApiError';

const heroImage = require('../assets/images/connectionCard.png');
const EMPTY_FORM = { first_name: '', last_name: '', email: '', password: '' };

// Erreurs propres à la connexion / inscription (les autres codes gardent leur texte par défaut)
const AUTH_MESSAGES = {
    401: { title: 'Connexion impossible', message: 'E-mail ou mot de passe incorrect.' },
    409: { title: 'Compte existant', message: 'Un compte existe déjà avec cet e-mail, connectez-vous.' },
};

function validate(mode, form) {
    const errors = {};
    if (mode === 'register') {
        if (!form.first_name.trim()) errors.first_name = 'Prénom requis';
        if (!form.last_name.trim()) errors.last_name = 'Nom requis';
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'E-mail invalide';
    if (mode === 'register' && form.password.length < 8) {
        errors.password = '8 caractères minimum';
    } else if (!form.password) {
        errors.password = 'Mot de passe requis';
    }
    return errors;
}

export default function AuthForm() {
    const { login, register } = useAuth();
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState(EMPTY_FORM);
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isRegister = mode === 'register';

    const update = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

    const switchMode = () => {
        setMode(isRegister ? 'login' : 'register');
        setFieldErrors({});
        setError(null);
    };

    const forgotPassword = () =>
        setError({
            title: 'Pas encore disponible',
            message: "La réinitialisation du mot de passe n'est pas encore disponible.",
        });

    const submit = async () => {
        const errors = validate(mode, form);
        setFieldErrors(errors);
        setError(null);
        if (Object.keys(errors).length) return;

        setSubmitting(true);
        try {
            const email = form.email.trim();
            if (isRegister) {
                await register({
                    first_name: form.first_name.trim(),
                    last_name: form.last_name.trim(),
                    email,
                    password: form.password,
                });
            } else {
                await login(email, form.password);
            }
        } catch (err) {
            setError(err);
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <ImageBackground
                    source={heroImage}
                    resizeMode="cover"
                    style={styles.hero}
                    imageStyle={styles.heroImage}
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(3, 29, 62, 0.9)']}
                        locations={[0.10, 1]}
                        style={[StyleSheet.absoluteFill, styles.heroImage]}
                    />
                    <Text style={styles.heroTitle}>Bienvenue</Text>
                    <Text style={styles.heroText}>
                        Vos évènements, vos billets et votre prochaine sortie, au même endroit.
                    </Text>
                </ImageBackground>

                <View style={styles.card}>
                    <Text style={styles.title}>{isRegister ? 'Créez votre compte' : 'Connectez-vous'}</Text>
                    <Text style={styles.subtitle}>
                        {isRegister ? 'Inscrivez-vous pour réserver vos billets.' : 'Retrouvez vos envies et vos billets.'}
                    </Text>

                    {isRegister && (
                        <>
                            <Field
                                label="Prénom"
                                icon="person-outline"
                                placeholder="Votre prénom"
                                value={form.first_name}
                                onChangeText={update('first_name')}
                                error={fieldErrors.first_name}
                                autoComplete="given-name"
                                maxLength={50}
                            />
                            <Field
                                label="Nom"
                                icon="person-outline"
                                placeholder="Votre nom"
                                value={form.last_name}
                                onChangeText={update('last_name')}
                                error={fieldErrors.last_name}
                                autoComplete="family-name"
                                maxLength={50}
                            />
                        </>
                    )}

                    <Field
                        label={isRegister ? 'E-mail' : 'Login'}
                        icon={isRegister ? 'mail-outline' : 'person-outline'}
                        placeholder="Votre adresse e-mail"
                        value={form.email}
                        onChangeText={update('email')}
                        error={fieldErrors.email}
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        maxLength={254}
                    />

                    <Field
                        label="Mot de passe"
                        icon="lock-closed-outline"
                        placeholder="Votre mot de passe"
                        value={form.password}
                        onChangeText={update('password')}
                        error={fieldErrors.password}
                        autoCapitalize="none"
                        autoComplete={isRegister ? 'new-password' : 'current-password'}
                        secureTextEntry={!showPassword}
                        maxLength={72}
                        onSubmitEditing={submit}
                        right={
                            <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={10}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={22}
                                    color={COLORS.navyLight}
                                />
                            </Pressable>
                        }
                    />

                    {!isRegister && (
                        <Pressable onPress={forgotPassword} style={styles.forgot} hitSlop={8}>
                            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                        </Pressable>
                    )}

                    <Pressable
                        onPress={submit}
                        disabled={submitting}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            (pressed || submitting) && styles.pressed,
                        ]}
                    >
                        {submitting ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Text style={styles.primaryButtonText}>
                                    {isRegister ? 'Créer mon compte' : 'Se connecter'}
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                            </>
                        )}
                    </Pressable>
                </View>

                {/* Bascule connexion / inscription */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>
                        {isRegister ? 'Déjà un compte ?' : 'Première visite ?'}
                    </Text>
                    <View style={styles.dividerLine} />
                </View>

                <Pressable
                    onPress={switchMode}
                    style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                >
                    <Text style={styles.secondaryButtonText}>
                        {isRegister ? 'Se connecter' : 'Créer un compte'}
                    </Text>
                </Pressable>
            </ScrollView>

            <LoadingPopup
                visible={submitting}
                title={isRegister ? 'Création du compte...' : 'Connexion...'}
            />

            <ErrorPopup
                error={error}
                onClose={() => setError(null)}
                // Réessayer seulement pour une erreur de l'API, pas pour un message écrit à la main
                onRetry={error instanceof ApiError ? submit : undefined}
                messages={AUTH_MESSAGES}
            />
        </KeyboardAvoidingView>
    );
}

function Field({ label, icon, error, right, ...inputProps }) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputRow, error && styles.inputRowError]}>
                <Ionicons name={icon} size={20} color={COLORS.navy} />
                <TextInput
                    style={styles.input}
                    placeholderTextColor={COLORS.textMuted}
                    {...inputProps}
                />
                {right}
            </View>
            {error && <Text style={styles.fieldError}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    content: {
        paddingTop: 16,
        paddingBottom: 120,
    },

    hero: {
        height: 220,
        justifyContent: 'flex-end',
        paddingHorizontal: 22,
        paddingBottom: 26,
        // Iphone
        shadowColor: COLORS.navy,
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        // Android
        elevation: 8,
        borderRadius: 32,
        backgroundColor: COLORS.navy,
    },
    heroImage: {
        borderRadius: 32,
    },
    heroTitle: {
        fontSize: 34,
        fontWeight: '700',
        color: COLORS.white,
        marginBottom: 6,
    },
    heroText: {
        fontSize: 16,
        lineHeight: 23,
        color: 'rgba(255, 255, 255, 0.9)',
    },

    card: {
        backgroundColor: COLORS.white,
        borderRadius: 28,
        padding: 22,
        marginTop: 18,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.navyLight,
        opacity: 0.7,
        marginTop: 4,
        marginBottom: 22,
    },
    field: {
        marginBottom: 16,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 52,
    },
    inputRowError: {
        borderColor: COLORS.error,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    fieldError: {
        color: COLORS.error,
        fontSize: 13,
        marginTop: 4,
    },
    forgot: {
        alignSelf: 'flex-end',
        marginTop: -2,
        marginBottom: 6,
    },
    forgotText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 54,
        backgroundColor: COLORS.navy,
        borderRadius: 16,
        marginTop: 16,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '700',
    },
    pressed: {
        opacity: 0.8,
    },

    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 24,
        marginBottom: 14,
        paddingHorizontal: 4,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        fontSize: 14,
        color: COLORS.navyLight,
        opacity: 0.7,
    },
    secondaryButton: {
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 16,
    },
    secondaryButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
    },
});
