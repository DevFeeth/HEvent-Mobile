import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/colors';

// Popup de confirmation animée (achat, paiement) : la carte monte, la coche « rebondit », puis le texte apparaît.
export default function SuccessPopup({ visible, title, message, buttonLabel = 'Continuer', onClose }) {
    const [card] = useState(() => new Animated.Value(0));
    const [check] = useState(() => new Animated.Value(0));
    const [text] = useState(() => new Animated.Value(0));

    useEffect(() => {
        if (!visible) return;
        card.setValue(0);
        check.setValue(0);
        text.setValue(0);
        const animation = Animated.sequence([
            Animated.timing(card, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.spring(check, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
            Animated.timing(text, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]);
        animation.start();
        return () => animation.stop();
    }, [visible, card, check, text]);

    const cardStyle = {
        opacity: card,
        transform: [{ translateY: card.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
    };
    const checkStyle = {
        transform: [
            { scale: check },
            { rotate: check.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] }) },
        ],
    };
    const textStyle = {
        opacity: text,
        transform: [{ translateY: text.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
    };

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <Animated.View style={[styles.card, cardStyle]}>
                    <Animated.View style={[styles.checkCircle, checkStyle]}>
                        <Ionicons name="checkmark" size={44} color={COLORS.white} />
                    </Animated.View>
                    <Animated.View style={[styles.textBlock, textStyle]}>
                        <Text style={styles.title}>{title}</Text>
                        {!!message && <Text style={styles.message}>{message}</Text>}
                        <Pressable onPress={onClose} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
                            <Text style={styles.buttonText}>{buttonLabel}</Text>
                        </Pressable>
                    </Animated.View>
                </Animated.View>
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
    checkCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.success,
        marginBottom: 18,
    },
    textBlock: { alignSelf: 'stretch', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
    message: { fontSize: 14, lineHeight: 20, textAlign: 'center', color: COLORS.navyLight, opacity: 0.8 },
    button: {
        alignSelf: 'stretch',
        height: 48,
        marginTop: 22,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.navy,
    },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
    pressed: { opacity: 0.8 },
});
