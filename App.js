import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';

import ScreenHome from './src/screens/ScreenHome';
import ScreenEvents from './src/screens/ScreenEvents';
import ScreenTickets from './src/screens/ScreenTickets';
import ScreenProfile from './src/screens/ScreenProfile';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
const Tab = createBottomTabNavigator();

const COLORS = {
  navy: '#0B1F3A',
  white: '#fff',
  bar: '#E4E4E9',
};

const ICONS = {
  Home: 'home-outline',
  Events: 'list-outline',
  Tickets: 'ticket-outline',
  Profile: 'person-outline',
};

export default function App() {

  useEffect(() => {
      NavigationBar.setVisibilityAsync('hidden');
    }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabItem,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Ionicons
                name={ICONS[route.name]}
                size={27}
                color={focused ? COLORS.white : COLORS.navy}
              />
            </View>
          ),
        })}
      >
        <Tab.Screen name='Home' component={ScreenHome} />
        <Tab.Screen name='Events' component={ScreenEvents} />
        <Tab.Screen name='Tickets' component={ScreenTickets} />
        <Tab.Screen name='Profile' component={ScreenProfile} />
      </Tab.Navigator>
    </NavigationContainer>
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
    shadowColor: '#000',
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
  iconWrapper: {
    width: 60,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperActive: {
    backgroundColor: COLORS.navy,
  },
});