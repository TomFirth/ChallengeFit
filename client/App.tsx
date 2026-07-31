import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import SocialScreen from './src/screens/SocialScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { ThemeProvider, useTheme } from './src/hooks/useTheme';
import { DataProvider } from './src/hooks/useData';
import Toast from 'react-native-toast-message';

const Tab = createBottomTabNavigator();

function LeaderboardNavigator() {
  const [currentScreen, setCurrentScreen] = useState('LeaderboardMain');

  if (currentScreen === 'CreateGroup') {
    return <CreateGroupScreen navigation={{ goBack: () => setCurrentScreen('LeaderboardMain') }} />;
  }

  return <LeaderboardScreen navigation={{ navigate: () => setCurrentScreen('CreateGroup') }} />;
}

function AppContent() {
  const { isDarkMode, colors } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subtext,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          }
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Missions',
            tabBarIcon: ({ color }) => <Text style={{ color }}>🎯</Text>
          }}
        />
        <Tab.Screen
          name="Social"
          component={SocialScreen}
          options={{
            tabBarLabel: 'Feed',
            tabBarIcon: ({ color }) => <Text style={{ color }}>🗞️</Text>
          }}
        />
        <Tab.Screen
          name="Leaderboard"
          component={LeaderboardNavigator}
          options={{
            tabBarLabel: 'Ranks',
            tabBarIcon: ({ color }) => <Text style={{ color }}>🏆</Text>
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => <Text style={{ color }}>⚙️</Text>
          }}
        />
      </Tab.Navigator>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Toast />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ThemeProvider>
  );
}
