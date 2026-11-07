import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import ErrorPopup from './ErrorPopup';
import { COLORS } from '../constants/colors';
import { canOrganize } from '../utils/roles';

const initials = (user) => `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();

export default function UserProfile({ user, onLogout }) {
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    const memberSince = new Date(user.created_at).getFullYear();

    const fullAddress = [user.address?.trim(), user.postal_code].filter((part) => part?.trim()).join(', ');;

    const accountRows = [
        { icon: 'mail-outline', label: 'Adresse e-mail', value: user.email },
        { icon: 'home-outline', label: 'Adresse', value: fullAddress },
        { icon: 'location-outline', label: 'Ville', value: user.city },
    ].filter((row) => row.value);

    const editProfile = () =>
        setError({
            title: 'Pas encore disponible',
            message: "La modification du profil n'est pas encore disponible.",
        });

    return (
        <View style={styles.flex}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={[COLORS.navy, COLORS.navyLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials(user)}</Text>
                    </View>

                    <View style={styles.headerText}>
                        <Text style={styles.name} numberOfLines={1}>
                            {user.first_name} {user.last_name}
                        </Text>
                        <Text style={styles.memberSince}>Membre depuis {memberSince}</Text>
                    </View>

                    <Pressable
                        onPress={editProfile}
                        hitSlop={8}
                        style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
                    >
                        <Ionicons name="pencil" size={16} color={COLORS.white} />
                    </Pressable>
                </LinearGradient>

                <Text style={styles.sectionTitle}>Mon compte client</Text>
                <View style={styles.card}>
                    {accountRows.map((row, index) => (
                        <View key={row.label}>
                            {index > 0 && <View style={styles.separator} />}
                            <InfoRow icon={row.icon} label={row.label} value={row.value} />
                        </View>
                    ))}
                </View>

                {canOrganize(user) && (
                    <>
                        <Text style={styles.sectionTitle}>Espace Organisateur</Text>
                        <Pressable
                            onPress={() => navigation.navigate('Organizer')}
                            style={({ pressed }) => [styles.card, styles.linkRow, pressed && styles.pressed]}
                        >
                            <View style={styles.rowIcon}>
                                <Ionicons name="construct-outline" size={18} color={COLORS.navy} />
                            </View>
                            <View style={styles.rowText}>
                                <Text style={styles.rowValue}>Gérer mes événements</Text>
                                <Text style={styles.rowLabel}>Événements, billets et ventes</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.navyLight} />
                        </Pressable>
                    </>
                )}
            </ScrollView>

            <Pressable
                onPress={onLogout}
                style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
            >
                <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                <Text style={styles.logoutText}>Se déconnecter</Text>
            </Pressable>

            <ErrorPopup error={error} onClose={() => setError(null)} />
        </View>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <View style={styles.row}>
            <View style={styles.rowIcon}>
                <Ionicons name={icon} size={18} color={COLORS.navy} />
            </View>
            <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowValue} numberOfLines={1}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    content: {
        paddingTop: 16,
        paddingBottom: 16,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderRadius: 24,
        padding: 16,
        // Ombre iOS
        shadowColor: COLORS.navy,
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        // Ombre Android
        elevation: 8,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.navyLight,
        borderColor: 'rgba(255, 255, 255, 0.85)',
        borderWidth: 2,
    },
    avatarText: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: '700',
    },
    headerText: {
        flex: 1,
    },
    name: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: '700',
    },
    memberSince: {
        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: 13,
        marginTop: 2,
    },
    editButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.35)',
        borderWidth: 1,
    },

    // Mon compte
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 22,
        marginBottom: 10,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
    },
    rowIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    rowText: {
        flex: 1,
    },
    rowLabel: {
        fontSize: 12,
        color: COLORS.navyLight,
        opacity: 0.7,
    },
    rowValue: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 1,
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.border,
        marginLeft: 46,
    },

    // Déconnexion, juste au-dessus de la barre d'onglets flottante
    logout: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#fff1f1',
        borderColor: '#ffd4d4',
        borderWidth: 1,
        marginBottom: 104,
    },
    logoutText: {
        color: COLORS.error,
        fontSize: 16,
        fontWeight: '700',
    },
    pressed: {
        opacity: 0.8,
    },
});
