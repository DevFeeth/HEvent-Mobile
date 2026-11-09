import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/colors';

export default function Field({ label, icon, error, right, disabled, ...inputProps }) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputRow, disabled && styles.inputRowDisabled, error && styles.inputRowError]}>
                <Ionicons name={icon} size={20} color={disabled ? COLORS.textMuted : COLORS.navy} />
                <TextInput
                    style={[styles.input, disabled && styles.inputDisabled]}
                    placeholderTextColor={COLORS.textMuted}
                    editable={!disabled}
                    {...inputProps}
                />
                {right}
            </View>
            {error && <Text style={styles.fieldError}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    field: { marginBottom: 16 },
    label: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
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
    inputRowError: { borderColor: COLORS.error },
    input: { flex: 1, fontSize: 16, color: COLORS.text },
    fieldError: { color: COLORS.error, fontSize: 13, marginTop: 4 },
    inputRowDisabled: { backgroundColor: COLORS.background },
    inputDisabled: { color: COLORS.textMuted },
});