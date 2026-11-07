import { StyleSheet, Text, View } from "react-native";
import { COLORS } from '../constants/colors';

export default function Tickets() {
    return (
        <View style={StyleSheet.container}>
            <Text>Tickets Page</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
});