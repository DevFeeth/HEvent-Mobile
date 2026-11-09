import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ScreenProfile from '../screens/ScreenProfile';
import ScreenOrganizer from '../screens/ScreenOrganizer';
import ScreenEditProfile from '../screens/ScreenEditProfile';
import ScreenScanQr from '../screens/ScreenScanQr';
import ScreenEditEvent from '../screens/ScreenEditEvent';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileHome" component={ScreenProfile} />
            <Stack.Screen name="Organizer" component={ScreenOrganizer} />
            <Stack.Screen name="EditProfile" component={ScreenEditProfile} />
            <Stack.Screen name="ScanQr" component={ScreenScanQr} />
            <Stack.Screen name="EditEvent" component={ScreenEditEvent} />
        </Stack.Navigator>
    );
}
