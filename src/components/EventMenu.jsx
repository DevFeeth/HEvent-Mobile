import { useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ErrorPopup from './ErrorPopup';
import { COLORS } from '../constants/colors';
import useAddToCalendar from '../hooks/useAddToCalendar';

// Bouton ⋮ en haut à droite de l'image d'un événement, avec un petit menu d'actions
export default function EventMenu({ event, address, top }) {
    const { available, added, addToCalendar, error, clearError } = useAddToCalendar(event, address);
    const [open, setOpen] = useState(false);
    // Sur iOS, l'écran du calendrier ne peut s'ouvrir qu'une fois le menu fermé (onDismiss)
    const pending = useRef(null);

    if (!available) return null;

    const run = (action) => {
        setOpen(false);
        if (Platform.OS === 'ios') pending.current = action;
        else action();
    };

    const onDismiss = () => {
        const action = pending.current;
        pending.current = null;
        action?.();
    };

    return (
        <>
            <Pressable
                onPress={() => setOpen(true)}
                hitSlop={8}
                style={({ pressed }) => [styles.trigger, { top }, pressed && styles.pressed]}
            >
                <Ionicons name="ellipsis-vertical" size={22} color={COLORS.navy} />
            </Pressable>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setOpen(false)}
                onDismiss={onDismiss}
            >
                <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
                    <Pressable style={[styles.menu, { top: top + 56 }]} onPress={() => {}}>
                        <Pressable
                            onPress={() => run(addToCalendar)}
                            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
                        >
                            <Ionicons
                                name={added ? 'checkmark-circle' : 'calendar-outline'}
                                size={20}
                                color={added ? COLORS.success : COLORS.navy}
                            />
                            <Text style={styles.itemText}>
                                {added ? 'Ajouté au calendrier' : 'Ajouter au calendrier'}
                            </Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>

            <ErrorPopup error={error} onClose={clearError} />
        </>
    );
}

const styles = StyleSheet.create({
    trigger: {
        position: 'absolute',
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
    },
    backdrop: { flex: 1, backgroundColor: 'rgba(3, 29, 62, 0.2)' },
    menu: {
        position: 'absolute',
        right: 16,
        paddingVertical: 6,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        shadowColor: COLORS.navy,
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
    itemText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    pressed: { opacity: 0.7 },
});
