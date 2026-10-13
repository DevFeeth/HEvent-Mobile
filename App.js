import { StyleSheet } from 'react-native';

import Home from './src/screens/ScreenHome';
import Events from './src/screens/ScreenEvents';
import Tickets from './src/screens/ScreenTickets';
import Profile from './src/screens/ScreenProfile';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName='Home' screenOptions={{ headerShown: false }}>
        <Tab.Screen name='Home' component={Home} />
        <Tab.Screen name='Events' component={Events} />
        <Tab.Screen name='Tickets' component={Tickets} />
        <Tab.Screen name='Profile' component={Profile} />
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
