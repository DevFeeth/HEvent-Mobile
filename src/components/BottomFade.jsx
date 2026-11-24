import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '../constants/colors';

// Fond en dégradé sous les éléments flottants (barre d'onglets, bouton d'action) :
// le contenu qui défile s'efface au lieu d'être visible derrière eux.
const FADE = ['rgba(240, 240, 245, 0)', COLORS.background];

export default function BottomFade({ style }) {
    return <LinearGradient colors={FADE} locations={[0, 0.35]} style={[styles.fade, style]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
    fade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
