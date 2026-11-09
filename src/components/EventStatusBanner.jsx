import { StyleSheet, View } from 'react-native';

import { EVENT_STATUS_BANNERS } from '../constants/eventStatus';

// Fine bande colorée du statut d'un événement : brouillon (brun), actif (vert), annulé (rouge), terminé (gris pâle)
export default function EventStatusBanner({ status, style }) {
    const banner = EVENT_STATUS_BANNERS[status];
    if (!banner) return null;

    return (
        <View
            style={[styles.banner, { backgroundColor: banner.background }, style]}
            accessibilityLabel={`Statut : ${banner.label}`}
        />
    );
}

const styles = StyleSheet.create({
    banner: {
        height: 6,
    },
});
