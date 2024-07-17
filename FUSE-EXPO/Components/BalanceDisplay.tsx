import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../ThemeContext';
import tw from 'twrnc';

const BalanceDisplay = () => {
  const { theme } = useTheme();

  // Set the color based on the theme
  const balanceColor = theme === 'light' ? '#181E20' : '#94B9C5';

  const balanceStyle = [tw`text-4xl font-bold mt-2`, { color: balanceColor }];

  return (
    <View style={tw`flex-1 justify-center my-5`}>
      <Text style={[tw`text-3xl`, { color: balanceColor }]}>Your Balance</Text>
      <Text style={balanceStyle}>$1,234.56</Text>
    </View>
  );
};

export default BalanceDisplay;
