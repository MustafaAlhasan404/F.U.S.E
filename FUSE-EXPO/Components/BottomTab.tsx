import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useTheme } from '../ThemeContext';
import { useRoute } from '@react-navigation/native';

interface BottomTabProps {
  navigation: any;
}

const BottomTab: React.FC<BottomTabProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const route = useRoute();

  const handlePress = (screen: string) => {
    navigation.navigate(screen);
  };

  const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
  const activeColor = theme === 'light' ? '#028174' : '#65e991';
  const inactiveColor = theme === 'light' ? '#888888' : '#AAAAAA';

  const getTabStyle = (screen: string) => {
    const isActive = route.name === screen;
    return isActive ? activeColor : inactiveColor;
  };

  const tabs = [
    { name: 'Home', icon: 'home-outline', label: 'Home' },
    { name: 'MyCard', icon: 'card-outline', label: 'My Cards' },
    { name: 'MyExpenses', icon: 'wallet-outline', label: 'Expenses' },
    { name: 'TransactionHistory', icon: 'swap-horizontal-outline', label: 'History' },
    { name: 'Profile', icon: 'person-outline', label: 'Profile' },
  ];

  return (
    <View style={[tw`flex-row justify-around items-center h-16 w-full shadow-md`, { backgroundColor }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={tw`flex-1 items-center justify-center p-2`}
          onPress={() => handlePress(tab.name)}
        >
          <Ionicons name={tab.icon} size={28} color={getTabStyle(tab.name)} />
          <Text style={[tw`mt-1 text-xs font-semibold`, { color: getTabStyle(tab.name) }]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default React.memo(BottomTab);
