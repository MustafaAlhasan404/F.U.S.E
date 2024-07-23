import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useTheme } from '../ThemeContext';
import { useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

interface BottomTabProps {
  navigation: any;
}

const BottomTab: React.FC<BottomTabProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const route = useRoute();

  const handlePress = (screen: string) => {
    navigation.navigate(screen);
  };

  const backgroundColor = theme === 'light' ? '#FFFFFF' : '#1A1A1A';
  const activeColor = theme === 'light' ? '#028174' : '#65e991';
  const inactiveColor = theme === 'light' ? '#888888' : '#AAAAAA';

  const getTabStyle = (screen: string) => {
    const isActive = route.name === screen;
    return isActive ? activeColor : inactiveColor;
  };

  const tabs = [
    { name: 'Home', icon: 'home', label: 'Home' },
    { name: 'MyCard', icon: 'card', label: 'My Cards' },
    { name: 'TransactionHistory', icon: 'swap-horizontal', label: 'History' },
    { name: 'Profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <LinearGradient
      colors={theme === 'light' ? ['#FFFFFF', '#F0F0F0'] : ['#303030', '#202020']}
      style={[
        tw`rounded-t-3xl shadow-lg`,
        Platform.OS === 'android' ? tw`h-18` : tw`h-28`
      ]}
    >
      <View style={tw`flex-row justify-around items-center w-full h-full`}>
        {tabs.map((tab) => {
          const isActive = route.name === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={tw`flex-1 items-center justify-center p-2`}
              onPress={() => handlePress(tab.name)}
            >
              <View style={tw`relative`}>
                {isActive && (
                  <View
                    style={[
                      tw`absolute -inset-3 rounded-full opacity-20`,
                      { backgroundColor: activeColor }
                    ]}
                  />
                )}
                <Ionicons
                  name={isActive ? tab.icon : `${tab.icon}-outline`}
                  size={Platform.OS === 'android' ? 20 : 28}
                  color={getTabStyle(tab.name)}
                  style={tw`z-10`}
                />
              </View>
              <View style={tw`flex-row items-center mb-4 mt-3`}>
                {isActive && (
                  <View style={[tw`w-1.5 h-1.5 rounded-full mr-1`, { backgroundColor: activeColor }]} />
                )}
                <Text
                  style={[
                    tw`text-xs font-bold`,
                    { color: getTabStyle(tab.name) },
                    isActive && Platform.OS === 'ios' && tw`text-sm`,
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </LinearGradient>
  );
};

export default React.memo(BottomTab);
