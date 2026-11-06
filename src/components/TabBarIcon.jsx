import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/colors';

export default function TabBarIcon({ name, focused }) {
    return (
        <View style={[styles.wrapper, focused && styles.wrapperActive]}>
            <Ionicons name={name} size={27} color={focused ? COLORS.white : COLORS.navy} />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: 75,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wrapperActive: {
        backgroundColor: COLORS.navy,
    },
});
