import { Pressable, StyleSheet, View } from 'react-native';
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import BottomFade from '../components/BottomFade';

import TabBarIcon from '../components/TabBarIcon';
import { COLORS } from '../constants/colors';
import ScreenHome from '../screens/ScreenHome';
import ScreenTickets from '../screens/ScreenTickets';
import ProfileStack from './ProfileStack';
import EventsStack from './EventsStack';

const Tab = createBottomTabNavigator();

const ICONS = {
    Home: 'home-outline',
    Events: 'list-outline',
    Tickets: 'ticket-outline',
    Profile: 'person-outline',
};

function TabButton({ children, onPress, onLongPress, style, accessibilityState, accessibilityLabel, testID }) {
    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="button"
            accessibilityState={accessibilityState}
            accessibilityLabel={accessibilityLabel}
            testID={testID}
            android_ripple={null}
            style={style}
        >
            {children}
        </Pressable>
    );
}

export default function BottomTabs() {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            // Barre flottante posée sur un fond en dégradé qui masque le contenu qui défile dessous
            tabBar={(props) => (
                <View style={styles.dock} pointerEvents="box-none">
                    <BottomFade style={styles.dockFade} />
                    <BottomTabBar {...props} />
                </View>
            )}
            screenOptions={({ route }) => ({
                headerShown: false,
                animation: 'shift',
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
                tabBarItemStyle: styles.tabItem,
                tabBarButton: (props) => <TabButton {...props} />,
                tabBarIcon: ({ focused }) => <TabBarIcon name={ICONS[route.name]} focused={focused} />,
            })}
        >
            <Tab.Screen name="Home" component={ScreenHome} />
            <Tab.Screen name="Events" component={EventsStack} />
            <Tab.Screen name="Tickets" component={ScreenTickets} />
            <Tab.Screen name="Profile" component={ProfileStack} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    dock: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 40,
    },
    dockFade: { top: 0 },
    tabBar: {
        height: 64,
        marginBottom: 20,
        borderRadius: 32,
        backgroundColor: COLORS.bar,
        elevation: 1,
        shadowColor: COLORS.navy,
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        marginLeft: 26,
        marginRight: 26,
    },
    tabItem: {
        padding: 12,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
