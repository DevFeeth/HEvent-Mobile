import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';

import { COLORS } from '../constants/colors';
import { scanTicket } from '../services/ticketService';
import { ApiError } from '../utils/ApiError';

const SAME_CODE_COOLDOWN_MS = 30000;
const RESULT_DURATION_MS = { success: 2500, warning: 4000, error: 4000 };
const QR_MAX_LENGTH = 500;

const REFUSALS = {
    'This ticket has already been used': 'Ce billet a déjà été utilisé.',
    'This ticket has been cancelled': 'Ce billet a été annulé.',
    'The order of this ticket is not paid': "La commande de ce billet n'est pas payée.",
    'This event is not open for entry': "L'événement n'est pas ouvert à l'entrée.",
    'This event has not started yet': "L'événement n'a pas encore commencé.",
    'This event is over': "L'événement est terminé.",
    'This QR code has expired, the ticket owner must refresh it':
        'QR code expiré : le participant doit rafraîchir son billet.',
    'This QR code is not valid': "Ce QR code n'est pas un billet valide.",
};

const STATUS_MESSAGES = {
    0: 'Serveur injoignable. Vérifiez votre connexion.',
    400: "Ce QR code n'est pas un billet valide.",
    401: 'Votre session a expiré, reconnectez-vous.',
    403: "Ce billet concerne un événement que vous ne gérez pas.",
    404: 'Billet introuvable.',
};

const RESULT_STYLES = {
    success: { icon: 'checkmark-circle', color: COLORS.success },
    warning: { icon: 'warning', color: COLORS.warning },
    error: { icon: 'close-circle', color: COLORS.error },
};

const ownerName = (ticket) =>
    [ticket.users?.first_name, ticket.users?.last_name].filter(Boolean).join(' ') || 'Participant';

function successResult(ticket, event) {
    const scannedEvent = ticket.ticket_type?.event;
    const details = [ticket.ticket_type?.name, ownerName(ticket)].filter(Boolean).join(' · ');
    // L'API valide tout billet d'un événement de l'organisateur, pas seulement celui ouvert ici
    if (event && scannedEvent && scannedEvent.id !== event.id) {
        return {
            kind: 'warning',
            title: 'Autre événement',
            message: `Billet validé, mais il est pour « ${scannedEvent.name} ». ${details}`,
        };
    }
    return { kind: 'success', title: 'Entrée validée', message: details };
}

function errorResult(err) {
    if (err instanceof ApiError) {
        const message = REFUSALS[err.message] ?? STATUS_MESSAGES[err.status];
        if (message) return { kind: 'error', title: 'Entrée refusée', message };
    }
    return { kind: 'error', title: 'Erreur', message: 'Le billet n’a pas pu être vérifié. Réessayez.' };
}

export default function ScreenScanQr() {
    const navigation = useNavigation();
    const { params } = useRoute();
    const event = params?.event;
    const isFocused = useIsFocused();
    const [permission, requestPermission] = useCameraPermissions();

    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState(null);
    const [scannedCount, setScannedCount] = useState(0);

    // Refs : onBarcodeScanned est appelé plusieurs fois par seconde, avant tout re-render
    const busyRef = useRef(false);
    const recentCodesRef = useRef(new Map());
    const resultTimerRef = useRef(null);

    const resume = useCallback(() => {
        clearTimeout(resultTimerRef.current);
        setResult(null);
        busyRef.current = false;
    }, []);

    useEffect(() => () => clearTimeout(resultTimerRef.current), []);

    const showResult = (next) => {
        setResult(next);
        clearTimeout(resultTimerRef.current);
        resultTimerRef.current = setTimeout(resume, RESULT_DURATION_MS[next.kind]);
    };

    const onBarcodeScanned = async ({ data }) => {
        if (busyRef.current || !data) return;

        const now = Date.now();
        const lastSeen = recentCodesRef.current.get(data);
        if (lastSeen && now - lastSeen < SAME_CODE_COOLDOWN_MS) return;

        busyRef.current = true;
        recentCodesRef.current.set(data, now);
        for (const [code, time] of recentCodesRef.current) {
            if (now - time >= SAME_CODE_COOLDOWN_MS) recentCodesRef.current.delete(code);
        }

        if (data.length > QR_MAX_LENGTH) {
            showResult(errorResult(new ApiError(400, 'This QR code is not valid')));
            return;
        }

        setChecking(true);
        try {
            const ticket = await scanTicket(data);
            setScannedCount((c) => c + 1);
            showResult(successResult(ticket, event));
        } catch (err) {
            // Réseau coupé : on autorise à rescanner le même code tout de suite
            if (err instanceof ApiError && err.status === 0) recentCodesRef.current.delete(data);
            showResult(errorResult(err));
        } finally {
            setChecking(false);
        }
    };

    const header = (
        <View style={styles.header}>
            <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={10}
                style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            >
                <Ionicons name="chevron-back" size={20} color={COLORS.white} />
            </Pressable>
            <View style={styles.headerText}>
                <Text style={styles.title}>Scanner les billets</Text>
                {!!event?.name && (
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {event.name}
                    </Text>
                )}
            </View>
            {scannedCount > 0 && (
                <View style={styles.counter}>
                    <Text style={styles.counterText}>{scannedCount}</Text>
                </View>
            )}
        </View>
    );

    // Permissions encore en cours de lecture
    if (!permission) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator color={COLORS.white} />
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.container}>
                {header}
                <View style={styles.center}>
                    <View style={styles.permissionCard}>
                        <View style={styles.permissionIcon}>
                            <Ionicons name="camera-outline" size={30} color={COLORS.navy} />
                        </View>
                        <Text style={styles.permissionTitle}>Accès à la caméra</Text>
                        <Text style={styles.permissionText}>
                            {permission.canAskAgain
                                ? 'La caméra est nécessaire pour scanner les QR codes des billets à l’entrée.'
                                : 'L’accès à la caméra a été refusé. Autorisez-le dans les réglages du téléphone pour scanner les billets.'}
                        </Text>
                        <Pressable
                            onPress={permission.canAskAgain ? requestPermission : () => Linking.openSettings()}
                            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                        >
                            <Text style={styles.primaryButtonText}>
                                {permission.canAskAgain ? 'Autoriser la caméra' : 'Ouvrir les réglages'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    const resultStyle = result && RESULT_STYLES[result.kind];

    return (
        <View style={styles.container}>
            {/* Une seule caméra active à la fois : on la démonte quand l'écran n'est plus affiché */}
            {isFocused && (
                <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={result || checking ? undefined : onBarcodeScanned}
                />
            )}

            <SafeAreaView style={styles.overlay} pointerEvents="box-none">
                {header}

                <View style={styles.viewfinderArea} pointerEvents="none">
                    <View
                        style={[
                            styles.viewfinder,
                            resultStyle && { borderColor: resultStyle.color },
                        ]}
                    />
                    <Text style={styles.hint}>
                        {checking ? 'Vérification du billet...' : 'Placez le QR code du billet dans le cadre'}
                    </Text>
                </View>

                {(checking || result) && (
                    <Pressable
                        onPress={result ? resume : undefined}
                        style={[styles.resultCard, resultStyle && { borderLeftColor: resultStyle.color }]}
                    >
                        {checking ? (
                            <ActivityIndicator color={COLORS.navy} />
                        ) : (
                            <Ionicons name={resultStyle.icon} size={34} color={resultStyle.color} />
                        )}
                        <View style={styles.resultText}>
                            <Text style={styles.resultTitle}>{checking ? 'Vérification...' : result.title}</Text>
                            {!!result?.message && <Text style={styles.resultMessage}>{result.message}</Text>}
                            {!!result && <Text style={styles.resultHint}>Touchez pour scanner le suivant</Text>}
                        </View>
                    </Pressable>
                )}
            </SafeAreaView>
        </View>
    );
}

const VIEWFINDER_SIZE = 250;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.navy,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    overlay: {
        flex: 1,
    },

    // En-tête
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginHorizontal: 16,
        marginTop: 8,
        padding: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(3, 29, 62, 0.75)',
    },
    back: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    headerText: {
        flex: 1,
    },
    title: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '700',
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 13,
        marginTop: 2,
    },
    counter: {
        minWidth: 32,
        height: 32,
        borderRadius: 16,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.success,
    },
    counterText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '700',
    },

    // Viseur
    viewfinderArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
    },
    viewfinder: {
        width: VIEWFINDER_SIZE,
        height: VIEWFINDER_SIZE,
        borderRadius: 28,
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    hint: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(3, 29, 62, 0.6)',
    },

    // Résultat (au-dessus de la barre d'onglets)
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginHorizontal: 16,
        marginBottom: 104,
        padding: 16,
        borderRadius: 20,
        borderLeftWidth: 6,
        borderLeftColor: COLORS.navy,
        backgroundColor: COLORS.white,
        shadowColor: COLORS.navy,
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    resultText: {
        flex: 1,
        gap: 2,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    resultMessage: {
        fontSize: 14,
        lineHeight: 20,
        color: COLORS.navyLight,
    },
    resultHint: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 4,
    },

    // Permission
    permissionCard: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 28,
        padding: 22,
        gap: 10,
    },
    permissionIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
    permissionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text,
    },
    permissionText: {
        fontSize: 15,
        lineHeight: 21,
        textAlign: 'center',
        color: COLORS.navyLight,
    },
    primaryButton: {
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 16,
        backgroundColor: COLORS.navy,
        marginTop: 8,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '700',
    },
    pressed: {
        opacity: 0.8,
    },
});
