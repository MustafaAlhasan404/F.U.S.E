import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import Login from './Screens/Login';
import Signup from './Screens/Signup';
import Home from './Screens/Home';
import Receive from './Screens/Receive';
import Send from './Screens/Send';
import Splashscreen from './Screens/Splashscreen';
import Profile from './Screens/profile';
export type RootStackParamList = {
  Splashscreen: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  MyExpenses: undefined; // Add MyExpenses to the navigation stack
  MakeTransaction: undefined; // Add MakeTransaction to the navigation stack
  Profile: undefined;
  MyCard: undefined;
  TransactionHistory: undefined; // Add TransactionHistory to the navigation stack
  Receive: undefined; // Add Receive to the navigation stack
  Pay: undefined; // Add Pay to the navigation stack
  Send: undefined; // Add Send to the navigation stack
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splashscreen"
        screenOptions={{
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS, // Apply the transition preset
        }}
      >
        <Stack.Screen
          name="Splashscreen"
          component={Splashscreen}
        />
        <Stack.Screen
          name="Login"
          component={Login}
        />
        <Stack.Screen
          name="Home"
          component={Home}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
        />
        <Stack.Screen
          name="Receive"
          component={Receive}
        />
        <Stack.Screen
          name="Send"
          component={Send}
        />
                <Stack.Screen
          name="Profile"
          component={Profile}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
