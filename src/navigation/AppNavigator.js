import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import TelegramScreen from '../screens/TelegramScreen';
import TerminalScreen from '../screens/TerminalScreen';
import FileBrowserScreen from '../screens/FileBrowserScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Telegram" component={TelegramScreen} />
      <Tab.Screen name="Terminal" component={TerminalScreen} />
      <Tab.Screen name="FileBrowser" component={FileBrowserScreen} />
    </Tab.Navigator>
  );
}
