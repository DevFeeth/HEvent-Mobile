import { StyleSheet, Text, View } from "react-native";
import { COLORS } from '../constants/colors';

export default function Events() {
    return (
        <View style={StyleSheet.container}>
            <Text>Events Page</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});