import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#4F46E5" />
      <AppNavigator />
    </>
  );
} 