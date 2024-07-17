// FUSE-EXPO/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import Login from './Screens/Login';
import Signup from './Screens/Signup';
import Home from './Screens/Home';
import MyExpenses from './Screens/MyExpenses'; // Import MyExpenses
import Profile from './Screens/profile';
import MyCard from './Screens/MyCards';
import TransactionHistory from './Screens/TransactionHistory'; // Import TransactionHistory
import Receive from './Screens/Receive';
import Pay from './Screens/Pay';
import Send from './Screens/Send';
import IssueBill from './Screens/IssueBill';
import Splashscreen from './Screens/Splashscreen';
import CardDetails from './Screens/CardDetails';

export type RootStackParamList = {
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
  IssueBill: undefined; // Add IssueBill to the navigation stack
  Splashscreen: undefined;
  CardDetails: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
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
          name="CardDetails"
          component={CardDetails}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
        />
        <Stack.Screen
          name="MyExpenses"
          component={MyExpenses}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
        />
        <Stack.Screen
          name="MyCard"
          component={MyCard}
        />
        <Stack.Screen
          name="TransactionHistory"
          component={TransactionHistory}
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
          name="Pay"
          component={Pay}
        />
        <Stack.Screen
          name="IssueBill"
          component={IssueBill}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
