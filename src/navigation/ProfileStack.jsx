import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ScreenProfile from '../screens/ScreenProfile';
import ScreenOrganizer from '../screens/ScreenOrganizer';
import ScreenEditProfile from '../screens/ScreenEditProfile';
import ScreenScanQr from '../screens/ScreenScanQr';
import ScreenEditEvent from '../screens/ScreenEditEvent';
import ScreenCreateEvent from '../screens/ScreenCreateEvent';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="ProfileHome" component={ScreenProfile} />
            <Stack.Screen name="Organizer" component={ScreenOrganizer} />
            <Stack.Screen name="EditProfile" component={ScreenEditProfile} />
            <Stack.Screen name="ScanQr" component={ScreenScanQr} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="EditEvent" component={ScreenEditEvent} />
            <Stack.Screen name="CreateEvent" component={ScreenCreateEvent} />
        </Stack.Navigator>
    );
}
