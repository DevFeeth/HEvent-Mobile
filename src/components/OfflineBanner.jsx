import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { COLORS } from '../constants/colors';
import { selectIsConnected } from '../store/networkSlice';

export default function OfflineBanner() {
    const isConnected = useSelector(selectIsConnected);
    if (isConnected) return null;

    return (
        <SafeAreaView edges={['top']} style={styles.container} pointerEvents="none">
            <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite">
                <Ionicons name="cloud-offline-outline" size={20} color={COLORS.white} />
                <View style={styles.texts}>
                    <Text style={styles.title}>Hors connexion</Text>
                    <Text style={styles.message}>
                        Vérifiez votre connexion internet. Les informations affichées peuvent ne pas être à jour.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { position: 'absolute', top: 0, left: 0, right: 0 },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 16,
        marginTop: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: COLORS.error,
        borderRadius: 16,
    },
    texts: { flex: 1 },
    title: { fontSize: 14, fontWeight: '700', color: COLORS.white },
    message: { fontSize: 12, color: COLORS.white },
});
