import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../ThemeContext';
import tw from 'twrnc';

const transactions = [
  { id: 1, description: 'Grocery Store', amount: '-$50.00' },
  { id: 2, description: 'Salary', amount: '+$2,000.00' },
  { id: 3, description: 'Coffee Shop', amount: '-$5.00' },
];

const RecentTransactions = () => {
  const { theme } = useTheme();

  // Set the colors based on the theme
  const textColor = '#888';
  const amountColor = theme === 'light' ? '#181E20' : '#94B9C5';

  const titleStyle = [tw`text-2xl font-bold mb-4`, { color: textColor }];
  const descriptionStyle = [tw`text-lg`, { color: textColor }];
  const amountStyle = [tw`text-lg font-bold`, { color: amountColor }];

  return (
    <View style={tw`flex-1 items-center justify-center w-full`}>
      {transactions.map(transaction => (
        <View key={transaction.id} style={tw`flex-row justify-between py-2 border-b border-gray-300 w-11/12`}>
          <Text style={descriptionStyle}>{transaction.description}</Text>
          <Text style={amountStyle}>{transaction.amount}</Text>
        </View>
      ))}
    </View>
  );
};

export default RecentTransactions;
