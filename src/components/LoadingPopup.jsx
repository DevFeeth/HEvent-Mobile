import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';

export default function LoadingPopup({
    visible,
    title = 'Chargement...',
    message = 'Nous préparons votre espace.\nMerci de patienter.',
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={() => {}}
        >
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <View style={styles.spinnerBox}>
                        <ActivityIndicator size="small" color={COLORS.navy} />
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
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
    spinnerBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        borderWidth: 1,
        marginBottom: 18,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        color: COLORS.navyLight,
        opacity: 0.7,
    },
});
