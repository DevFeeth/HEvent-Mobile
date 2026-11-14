import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/colors';

// Popup de confirmation (même style qu'ErrorPopup).
// destructive : bouton de confirmation en rouge (suppression, abandon des modifications...)
export default function ConfirmPopup({
    visible,
    title,
    message,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    icon,
    destructive = false,
    onConfirm,
    onCancel,
}) {
    const accent = destructive ? COLORS.error : COLORS.navy;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onCancel}
        >
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <View style={[styles.iconBox, destructive ? styles.iconBoxDanger : styles.iconBoxInfo]}>
                        <Ionicons
                            name={icon ?? (destructive ? 'trash-outline' : 'help-circle-outline')}
                            size={26}
                            color={accent}
                        />
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    {!!message && <Text style={styles.message}>{message}</Text>}

                    <View style={styles.actions}>
                        <Pressable
                            onPress={onConfirm}
                            style={({ pressed }) => [
                                styles.primaryButton,
                                { backgroundColor: accent },
                                pressed && styles.pressed,
                            ]}
                        >
                            <Text style={styles.primaryButtonText}>{confirmLabel}</Text>
                        </Pressable>
                        <Pressable
                            onPress={onCancel}
                            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                        >
                            <Text style={styles.secondaryButtonText}>{cancelLabel}</Text>
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
        backgroundColor: 'rgba(3, 29, 62, 0.55)',
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
        shadowColor: COLORS.navy,
        shadowOpacity: 0.15,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },
    iconBoxDanger: { backgroundColor: '#fdecea' },
    iconBoxInfo: { backgroundColor: COLORS.background },
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
