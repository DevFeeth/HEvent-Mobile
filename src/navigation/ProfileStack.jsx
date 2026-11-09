import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ScreenProfile from '../screens/ScreenProfile';
import ScreenOrganizer from '../screens/ScreenOrganizer';
import ScreenEditProfile from '../screens/ScreenEditProfile';

const Stack = createNativeStackNavigator();

// Pages accessibles depuis l'onglet Profil (la barre d'onglets reste visible)
export default function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileHome" component={ScreenProfile} />
            <Stack.Screen name="Organizer" component={ScreenOrganizer} />
            <Stack.Screen name="EditProfile" component={ScreenEditProfile} />
        </Stack.Navigator>
    );
}
