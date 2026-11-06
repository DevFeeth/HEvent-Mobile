import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';
import { getErrorMessage } from '../utils/ApiError';

export default function ErrorMessage({ error, onRetry }) {
    if (!error) return null;

    return (
        <View style={styles.box}>
            <Text style={styles.text}>{getErrorMessage(error)}</Text>
            {onRetry && (
                <Pressable onPress={onRetry} style={styles.button}>
                    <Text style={styles.buttonText}>Réessayer</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        marginTop: 32,
        alignItems: 'center',
        gap: 12,
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        color: COLORS.text,
    },
    button: {
        backgroundColor: COLORS.navy,
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: '600',
    },
});
