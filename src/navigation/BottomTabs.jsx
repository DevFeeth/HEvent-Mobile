import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TabBarIcon from '../components/TabBarIcon';
import { COLORS } from '../constants/colors';
import ScreenHome from '../screens/ScreenHome';
import ScreenEvents from '../screens/ScreenEvents';
import ScreenTickets from '../screens/ScreenTickets';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

const ICONS = {
    Home: 'home-outline',
    Events: 'list-outline',
    Tickets: 'ticket-outline',
    Profile: 'person-outline',
};

export default function BottomTabs() {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
                tabBarItemStyle: styles.tabItem,
                tabBarIcon: ({ focused }) => <TabBarIcon name={ICONS[route.name]} focused={focused} />,
            })}
        >
            <Tab.Screen name="Home" component={ScreenHome} />
            <Tab.Screen name="Events" component={ScreenEvents} />
            <Tab.Screen name="Tickets" component={ScreenTickets} />
            <Tab.Screen name="Profile" component={ProfileStack} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 20,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.bar,
        elevation: 1,
        shadowColor: COLORS.navy,
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        marginLeft: 10,
        marginRight: 10,
    },
    tabItem: {
        padding: 12,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
