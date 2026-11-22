import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/colors';

// Image d'un événement, avec une image par défaut s'il n'en a pas ou si le lien ne charge pas
export default function EventImage({ uri, style, iconSize = 26 }) {
    const [failedUri, setFailedUri] = useState(null);

    if (uri && uri !== failedUri) {
        return <Image source={{ uri }} style={style} onError={() => setFailedUri(uri)} />;
    }
    return (
        <View style={[style, styles.placeholder]}>
            <Ionicons name="musical-notes-outline" size={iconSize} color={COLORS.white} />
        </View>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.navyLight,
    },
});
