import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthForm from '../components/AuthForm';
import LoadingPopup from '../components/LoadingPopup';
import UserProfile from '../components/UserProfile';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

export default function ScreenProfile() {
    const { user, loading, logout } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <LoadingPopup visible />
            ) : user ? (
                <UserProfile user={user} onLogout={logout} />
            ) : (
                <AuthForm />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
    },
});
