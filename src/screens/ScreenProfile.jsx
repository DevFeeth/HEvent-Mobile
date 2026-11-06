import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthForm from '../components/AuthForm';
import LoadingPopup from '../components/LoadingPopup';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

export default function ScreenProfile() {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <LoadingPopup visible />
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <AuthForm />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, styles.center]}>
            <View style={styles.placeholder}>
                <Text style={styles.title}>Bonjour {user.first_name}</Text>
                <Text style={styles.text}>La page profil arrive bientôt.</Text>

                <Pressable onPress={logout} style={styles.logout}>
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        alignItems: 'center',
        gap: 8,
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
    logout: {
        marginTop: 16,
        borderColor: COLORS.navy,
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    logoutText: {
        color: COLORS.navy,
        fontSize: 16,
        fontWeight: '600',
    },
});
