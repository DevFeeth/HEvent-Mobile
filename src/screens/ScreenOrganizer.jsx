import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS } from '../constants/colors';

export default function ScreenOrganizer() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    hitSlop={10}
                    style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
                >
                    <Ionicons name="chevron-back" size={22} color={COLORS.navy} />
                </Pressable>
                <Text style={styles.title}>Espace organisateur</Text>
            </View>

            {/* Contenu de l'espace organisateur à venir */}
            <Text style={styles.text}>Cette page arrive bientôt.</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 16,
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
    },
    text: {
        fontSize: 15,
        color: COLORS.navyLight,
    },
    pressed: {
        opacity: 0.7,
    },
});
