import 'react-native-url-polyfill/auto';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TerminalScreen from './src/screens/TerminalScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar hidden style="light" backgroundColor="#0d1117" />
      <TerminalScreen />
    </SafeAreaProvider>
  );
}
