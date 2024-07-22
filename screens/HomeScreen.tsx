import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import WeekScreen from './WeekScreen.tsx';
import TodayScreen from './TodayScreen.tsx';

const Tab = createBottomTabNavigator();

const HomeScreen: React.FC = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Week" component={WeekScreen} />
      <Tab.Screen name="Today" component={TodayScreen} />
    </Tab.Navigator>
  );
};

export default HomeScreen;
