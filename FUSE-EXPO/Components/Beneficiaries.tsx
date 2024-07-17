import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../ThemeContext';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the FontAwesome icon set

const beneficiaries = [
  { id: 1, name: 'Agus Kardiana', currency: 'USD', methods: 'Bank, Wallet', icon: 'user' },
  { id: 2, name: 'Hendra Alden', currency: 'IDR', methods: 'Bank, Wallet, Mobile', icon: 'user' },
];

const Beneficiaries = () => {
  const { theme } = useTheme();

  // Set the colors based on the theme
  const textColor = theme === 'light' ? '#333' : '#DDD';
  const cardBackgroundColor = theme === 'light' ? '#FFF' : '#424242';
  const containerBackgroundColor = theme === 'light' ? '#F5F5F5' : '#303030';

  // Get the screen width
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={[tw`flex-1 items-center justify-center p-5`, { backgroundColor: containerBackgroundColor }]}>
      {beneficiaries.map(beneficiary => (
        <View 
          key={beneficiary.id} 
          style={[
            tw`flex-row items-center p-4 my-2 rounded-lg shadow`, 
            { backgroundColor: cardBackgroundColor, borderRadius: 10, width: screenWidth * 0.9 }
          ]}
        >
          <Icon name={beneficiary.icon} size={24} color={textColor} style={tw`mr-4`} />
          <View style={tw`flex-1 ml-2`}>
            <Text style={[tw`text-lg font-bold`, { color: textColor }]}>{beneficiary.name}</Text>
          </View>
          <View style={tw`items-end`}>
            <Text style={[tw`text-xs font-bold`, { color: textColor }]}>{beneficiary.currency}</Text>
            <Text style={[tw`text-xs font-bold`, { color: textColor }]}>{beneficiary.methods}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default Beneficiaries;
