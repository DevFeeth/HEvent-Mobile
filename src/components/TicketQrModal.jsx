import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

import { COLORS } from '../constants/colors';
import { getTicketQrToken } from '../services/ticketService';
import { ApiError, getErrorContent } from '../utils/ApiError';
import { formatLongDate, formatTimeRange } from '../utils/formatDateTime';

const REFRESH_MS = 15000;

const REFUSALS = {
    'This ticket has already been used': 'Ce billet a déjà été utilisé.',
    'This ticket has been cancelled': 'Ce billet a été annulé.',
    'The order of this ticket is not paid': 'La commande de ce billet n’est pas encore payée.',
    'This event is not open for entry': 'L’événement n’est pas ouvert à l’entrée.',
    'This event has not started yet': 'Le QR code sera disponible le jour de l’événement.',
    'This event is over': 'L’événement est terminé.',
};

const errorMessage = (err) =>
    (err instanceof ApiError && REFUSALS[err.message]) || getErrorContent(err).message;

export default function TicketQrModal({ ticket, onClose }) {
    return (
        <Modal
            visible={!!ticket}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.backdrop}>
                {!!ticket && <TicketQrCard key={ticket.id} ticket={ticket} onClose={onClose} />}
            </View>
        </Modal>
    );
}

function TicketQrCard({ ticket, onClose }) {
    const [qr, setQr] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const { qr_token } = await getTicketQrToken(ticket.id);
                if (active) {
                    setQr(qr_token);
                    setError(null);
                }
            } catch (err) {
                if (active) setError(errorMessage(err));
            }
        };

        load();
        const timer = setInterval(load, REFRESH_MS);
        return () => {
            active = false;
            clearInterval(timer);
        };
    }, [ticket]);

    const event = ticket.ticket_type?.event;

    return (
        <View style={styles.card}>
            <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
                <Ionicons name="close" size={24} color={COLORS.navy} />
            </Pressable>

            {!!event && (
                <>
                    <Text style={styles.title} numberOfLines={2}>
                        {event.name}
                    </Text>
                    <Text style={styles.meta}>
                        {formatLongDate(event.start_date)} ·{' '}
                        {formatTimeRange(event.start_time, event.end_time)}
                    </Text>
                    <Text style={styles.type}>{ticket.ticket_type.name}</Text>
                </>
            )}

            <View style={styles.qrBox}>
                {error ? (
                    <View style={styles.qrMessage}>
                        <Ionicons name="qr-code-outline" size={40} color={COLORS.textMuted} />
                        <Text style={styles.qrMessageText}>{error}</Text>
                    </View>
                ) : qr ? (
                    <QRCode value={qr} size={220} color={COLORS.navy} backgroundColor={COLORS.white} />
                ) : (
                    <ActivityIndicator color={COLORS.navy} />
                )}
            </View>

            {!error && (
                <Text style={styles.hint}>
                    Présentez ce QR code à l’entrée. Il se renouvelle automatiquement, une capture d’écran ne
                    fonctionnera pas.
                </Text>
            )}
            <Text style={styles.ticketId}>Billet n° {ticket.id}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(3, 29, 62, 0.75)',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 28,
        paddingTop: 28,
        paddingBottom: 22,
        paddingHorizontal: 22,
    },
    close: { position: 'absolute', top: 14, right: 14 },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    meta: { fontSize: 14, color: COLORS.navyLight, marginTop: 4, textAlign: 'center' },
    type: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.navy,
        backgroundColor: COLORS.background,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
        overflow: 'hidden',
    },
    qrBox: {
        width: 252,
        height: 252,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    qrMessage: { alignItems: 'center', gap: 12, paddingHorizontal: 20 },
    qrMessageText: { fontSize: 14, lineHeight: 20, color: COLORS.navyLight, textAlign: 'center' },
    hint: {
        fontSize: 13,
        lineHeight: 18,
        color: COLORS.navyLight,
        opacity: 0.8,
        textAlign: 'center',
        marginTop: 16,
    },
    ticketId: { fontSize: 12, color: COLORS.textMuted, marginTop: 10 },
});
