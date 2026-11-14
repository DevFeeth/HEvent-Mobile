import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/colors';

export default function OptionSheet({ visible, title, options, selected, onSelect, onClose }) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.sheet} onPress={() => {}}>
                    <Text style={styles.title}>{title}</Text>
                    {options.map((option) => {
                        const active = option.value === selected;
                        return (
                            <Pressable
                                key={String(option.value)}
                                onPress={() => {
                                    onSelect(option.value);
                                    onClose();
                                }}
                                style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                            >
                                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                                    {option.label}
                                </Text>
                                {active && <Ionicons name="checkmark" size={20} color={COLORS.navy} />}
                            </Pressable>
                        );
                    })}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(3, 29, 62, 0.55)',
    },
    sheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 32,
    },
    title: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomColor: COLORS.border,
        borderBottomWidth: 1,
    },
    optionText: { fontSize: 16, color: COLORS.text },
    optionTextActive: { fontWeight: '700', color: COLORS.navy },
    pressed: { opacity: 0.7 },
});