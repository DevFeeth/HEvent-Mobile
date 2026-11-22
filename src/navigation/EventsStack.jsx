import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ScreenEventDetail from '../screens/ScreenEventDetail';
import ScreenEvents from '../screens/ScreenEvents';

const Stack = createNativeStackNavigator();

export default function EventsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="EventList" component={ScreenEvents} />
            <Stack.Screen name="EventDetail" component={ScreenEventDetail} />
        </Stack.Navigator>
    );
}