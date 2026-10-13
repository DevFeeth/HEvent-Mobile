import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenHome from './src/screens/ScreenHome';
import ScreenEvents from './src/screens/ScreenEvents';
import ScreenTickets from './src/screens/ScreenTickets';
import ScreenProfile from './src/screens/ScreenProfile';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator 
        initialRouteName='Home' 
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: 'gray',
          tabBarIcon: ({ focused, color, size}) => {
            const icons = {
              Home: focused ? 'home' : 'home-outline',
              Events: focused ? 'calendar' : 'calendar-outline',
              Tickets: focused ? 'ticket' : 'ticket-outline',
              Profile: focused ? 'person' : 'person-outline',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
        })}>
        <Tab.Screen name='Home' component={ScreenHome} />
        <Tab.Screen name='Events' component={ScreenEvents} />
        <Tab.Screen name='Tickets' component={ScreenTickets} />
        <Tab.Screen name='Profile' component={ScreenProfile} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
