import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ScreenCheckout from '../screens/ScreenCheckout';
import ScreenEventDetail from '../screens/ScreenEventDetail';
import ScreenEvents from '../screens/ScreenEvents';

const Stack = createNativeStackNavigator();

export default function EventsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="EventList" component={ScreenEvents} />
            <Stack.Screen name="EventDetail" component={ScreenEventDetail} />
            <Stack.Screen name="Checkout" component={ScreenCheckout} options={{ animation: 'slide_from_bottom' }} />
        </Stack.Navigator>
    );
}