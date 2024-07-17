import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StatusBar, RefreshControl, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../ThemeContext';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/Feather';
import BottomTab from '../Components/BottomTab';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import axios from 'axios';
import baseUrl from '../baseUrl';
import { decryptData, encryptData } from '../crypto-utils';
const transactions = [
  // Sample data
  { id: '1', type: 'send', amount: '100', date: '2023-01-01' },
  { id: '2', type: 'request', amount: '200', date: '2023-01-02' },
  // Add more transactions here
];

const TransactionHistory: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const primaryColor = theme === 'light' ? '#006e63' : '#65e991';

  const jwt = useSelector((state: RootState) => state.auth.jwt);
  const aesKey = useSelector((state: RootState) => state.auth.aesKey);

  const [transactions, setTransactions] = useState<any[]>([]);


  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.post(`${baseUrl}/user/received`, { jwt });
        const decryptedPayload = decryptData(response.data.payload, aesKey);
        const response2 = await axios.post(`${baseUrl}/user/sent`, { jwt });
        const decryptedPayload2 = decryptData(response2.data.payload, aesKey);

        const allTransactions = [];

        // Received
        decryptedPayload.recived.bills.forEach(bill => {
          allTransactions.push(
            {
              id: bill.id,
              direction: "incoming",
              type: "Payment",
              date: new Date(bill.payedAt),
              person: bill.card ? bill.card.account.user.name : "N/A",
              details: bill.details,
              amount: bill.amount,
            }
          );
        });
        decryptedPayload.recived.cash.forEach(deposit => {
          allTransactions.push(
            {
              id: deposit.id,
              direction: "incoming",
              type: "Deposit",
              date: new Date(deposit.createdAt),
              person: deposit.card ? deposit.card.account.user.name : "N/A",
              details: "No details available",
              amount: deposit.amount,
            }
          );
        });
        decryptedPayload.recived.transfer.forEach(transfer => {
          allTransactions.push(
            {
              id: transfer.id,
              direction: "incoming",
              type: "Transfer",
              date: new Date(transfer.createdAt),
              person: transfer.sAccount ? transfer.sAccount.user.name : "N/A",
              details: "No details available",
              amount: transfer.amount,
            }
          );
        });
        // console.log("All Transactions: " + JSON.stringify(allTransactions));

        // Sent
        decryptedPayload2.sent.bills.forEach(bill => {
          allTransactions.push(
            {
              id: bill.id,
              direction: "outgoing",
              type: "Payment",
              date: new Date(bill.payedAt),
              person: bill.merchantAccount.user.merchant.Category.name,
              details: bill.details || "No details available",
              amount: bill.amount,
            }
          );
        });
        decryptedPayload2.sent.transfer.forEach(transfer => {
          allTransactions.push(
            {
              id: transfer.id,
              direction: "outgoing",
              type: "Transfer",
              date: new Date(transfer.createdAt),
              person: transfer.dAccount ? transfer.dAccount.user.name : "N/A",
              details: "No details available",
              amount: transfer.amount,
            }
          );
        });

        allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
        setTransactions(allTransactions);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // fetchCards();
  }, []);

  const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
  const textColor = theme === 'light' ? '#1F1F1F' : '#FFFFFF';
  const cardBackgroundColor = theme === 'light' ? '#F0F0F0' : '#424242';
  const buttonColor = theme === 'light' ? '#028174' : '#65e991';
  const buttonTextColor = theme === 'light' ? '#FFFFFF' : '#181E20';
  const placeholderColor = theme === 'light' ? '#999999' : '#A0A0A0';

  const titleStyle = [tw`text-2xl font-bold ml-2`, { color: textColor }];
  const filterButtonStyle = [tw`p-2 rounded-lg mx-1`, { backgroundColor: buttonColor }];

  const CustomButton = ({ iconName, onPress, isActive }: { iconName: string, onPress: () => void, isActive: boolean }) => (
    <TouchableOpacity
      style={[filterButtonStyle, { opacity: isActive ? 1 : 0.7 }]}
      onPress={onPress}
    >
      <Icon name={iconName} size={24} color={buttonTextColor} />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[tw`flex-1`, { backgroundColor }]}>
        <StatusBar backgroundColor={backgroundColor} barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center mb-4 p-5`}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-2`}>
              <Icon name="arrow-left" size={28} color={textColor} />
            </TouchableOpacity>
            <Text style={titleStyle}>Transaction History</Text>
          </View>
          <ScrollView
            style={tw``}
          >
            {transactions && transactions.map((transaction, index) => (
              <View key={index} style={[tw`flex-row items-center justify-start mx-2 my-0.5 py-2 px-4 border rounded-2xl`, { borderColor: primaryColor }]}>
                <Icon
                  name={transaction.direction == "incoming" ? "arrow-down" : "arrow-up"}
                  size={25}
                  color={transaction.direction == "incoming" ? primaryColor : "red"} />
                <View style={tw`w-grow ml-4`}>
                  <Text style={[tw`text-xs`, { color: textColor }]}>{transaction.date.toDateString()} - {transaction.type}</Text>
                  <Text style={[tw`text-xl font-bold`, { color: textColor }]}>{transaction.person}</Text>
                  <Text style={[tw`text-xs`, { color: textColor }]}>{transaction.details}</Text>
                </View>
                <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>${transaction.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <BottomTab navigation={navigation} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default TransactionHistory;
