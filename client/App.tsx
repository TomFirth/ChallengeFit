import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';
import { styles } from './src/styles/AppStyles';
import HomeScreen from './src/screens/HomeScreen';
import SocialScreen from './src/screens/SocialScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { ThemeProvider, useTheme } from './src/hooks/useTheme';
import { DataProvider } from './src/hooks/useData';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
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
  const { user, isLoading } = useAuth();
  const [currentAuthScreen, setCurrentAuthScreen] = useState('Login');

  if (isLoading) {
      return (
          <View style={[styles.centered, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      );
  }

  if (!user) {
      return (
          <NavigationContainer>
              {currentAuthScreen === 'Login' ? (
                  <LoginScreen navigation={{ navigate: (screen: string) => setCurrentAuthScreen(screen) }} />
              ) : (
                  <RegisterScreen navigation={{ goBack: () => setCurrentAuthScreen('Login') }} />
              )}
              <StatusBar style={isDarkMode ? 'light' : 'dark'} />
              <Toast />
          </NavigationContainer>
      );
  }

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
                tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}></Text>
              }}
            />
            <Tab.Screen
              name="Social"
              component={SocialScreen}
              options={{
                tabBarLabel: 'Feed',
                tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}></Text>
              }}
            />
            <Tab.Screen
              name="Leaderboard"
              component={LeaderboardNavigator}
              options={{
                tabBarLabel: 'Ranks',
                tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}></Text>
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                tabBarLabel: 'Settings',
                tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}></Text>
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
    <AuthProvider>
        <ThemeProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </ThemeProvider>
    </AuthProvider>
  );
}
