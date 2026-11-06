import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/colors';
import { getErrorMessage } from '../utils/ApiError';

const DANGER = '#c62828';

// Popup d'erreur par-dessus l'écran, s'affiche tant que error n'est pas null
// <ErrorPopup error={error} onClose={() => setError(null)} />
// <ErrorPopup error={error} onClose={...} onRetry={refetch} messages={{ 401: 'E-mail ou mot de passe incorrect.' }} />
export default function ErrorPopup({
    error,
    onClose,
    onRetry,
    messages,
    title = 'Une erreur est survenue',
}) {
    const retry = () => {
        onClose();
        onRetry();
    };

    return (
        <Modal
            visible={!!error}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose} // bouton retour Android
        >
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <View style={styles.iconBox}>
                        <Ionicons name="alert-circle-outline" size={26} color={DANGER} />
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    {error && <Text style={styles.message}>{getErrorMessage(error, messages)}</Text>}

                    <View style={styles.actions}>
                        {onRetry && (
                            <Pressable
                                onPress={retry}
                                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                            >
                                <Text style={styles.primaryButtonText}>Réessayer</Text>
                            </Pressable>
                        )}
                        <Pressable
                            onPress={onClose}
                            style={({ pressed }) => [
                                onRetry ? styles.secondaryButton : styles.primaryButton,
                                pressed && styles.pressed,
                            ]}
                        >
                            <Text style={onRetry ? styles.secondaryButtonText : styles.primaryButtonText}>
                                {onRetry ? 'Fermer' : 'OK'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(3, 29, 62, 0.35)', // navy assombri
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        paddingVertical: 28,
        paddingHorizontal: 24,
        // Ombre iOS
        shadowColor: COLORS.navy,
        shadowOpacity: 0.15,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        // Ombre Android
        elevation: 8,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fdecea', // rouge très clair
        marginBottom: 18,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        color: COLORS.navyLight,
        opacity: 0.8,
    },
    actions: {
        alignSelf: 'stretch',
        gap: 10,
        marginTop: 22,
    },
    primaryButton: {
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.navy,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: COLORS.border,
        borderWidth: 1,
    },
    secondaryButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '700',
    },
    pressed: {
        opacity: 0.8,
    },
});
