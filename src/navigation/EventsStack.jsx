import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ScreenCheckout from '../screens/ScreenCheckout';
import ScreenEventDetail from '../screens/ScreenEventDetail';
import ScreenEvents from '../screens/ScreenEvents';

const Stack = createNativeStackNavigator();

export default function EventsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="EventList" component={ScreenEvents} />
            <Stack.Screen name="EventDetail" component={ScreenEventDetail} />
            <Stack.Screen name="Checkout" component={ScreenCheckout} />
        </Stack.Navigator>
    );
}