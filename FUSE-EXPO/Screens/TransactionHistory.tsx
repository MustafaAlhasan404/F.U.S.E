import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, FlatList, SafeAreaView, Dimensions } from 'react-native';
import { useTheme } from '../ThemeContext';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/Feather';
import BottomTab from '../Components/BottomTab';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import axios from 'axios';
import baseUrl from '../baseUrl';
import { decryptData } from '../crypto-utils';

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
          allTransactions.push({
            id: bill.id,
            direction: "incoming",
            type: "Payment",
            date: new Date(bill.payedAt),
            person: bill.card ? bill.card.account.user.name : "N/A",
            details: bill.details,
            amount: bill.amount,
          });
        });
        decryptedPayload.recived.cash.forEach(deposit => {
          allTransactions.push({
            id: deposit.id,
            direction: "incoming",
            type: "Deposit",
            date: new Date(deposit.createdAt),
            person: deposit.card ? deposit.card.account.user.name : "N/A",
            details: "No details available",
            amount: deposit.amount,
          });
        });
        decryptedPayload.recived.transfer.forEach(transfer => {
          allTransactions.push({
            id: transfer.id,
            direction: "incoming",
            type: "Transfer",
            date: new Date(transfer.createdAt),
            person: transfer.sAccount ? transfer.sAccount.user.name : "N/A",
            details: "No details available",
            amount: transfer.amount,
          });
        });

        // Sent
        decryptedPayload2.sent.bills.forEach(bill => {
          allTransactions.push({
            id: bill.id,
            direction: "outgoing",
            type: "Payment",
            date: new Date(bill.payedAt),
            person: bill.merchantAccount.user.merchant.Category.name,
            details: bill.details || "No details available",
            amount: bill.amount,
          });
        });
        decryptedPayload2.sent.transfer.forEach(transfer => {
          allTransactions.push({
            id: transfer.id,
            direction: "outgoing",
            type: "Transfer",
            date: new Date(transfer.createdAt),
            person: transfer.dAccount ? transfer.dAccount.user.name : "N/A",
            details: "No details available",
            amount: transfer.amount,
          });
        });

        allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
        setTransactions(allTransactions);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchCards();
  }, []);

  const backgroundColor = theme === 'light' ? '#F8F9FA' : '#1A1A1A';
  const textColor = theme === 'light' ? '#1F1F1F' : '#FFFFFF';
  const cardBackgroundColor = theme === 'light' ? '#FFFFFF' : '#2C2C2C';
  const secondaryTextColor = theme === 'light' ? '#6C757D' : '#B0B0B0';

  const titleStyle = [tw`text-2xl font-bold ml-2`, { color: textColor }];

  const renderItem = ({ item: transaction }) => (
    <View style={[
      tw`flex-row items-center justify-between mx-4 my-2 py-4 px-4 rounded-xl`,
      { backgroundColor: cardBackgroundColor, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }
    ]}>
      <View style={tw`flex-row items-center`}>
        <View style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: transaction.direction === "incoming" ? primaryColor : '#FF4136' }]}>
          <Icon
            name={transaction.direction === "incoming" ? "arrow-down" : "arrow-up"}
            size={20}
            color="#000000"
          />
        </View>
        <View style={tw`ml-4`}>
          <Text style={[tw`text-lg font-semibold`, { color: textColor }]}>{transaction.person}</Text>
          <Text style={[tw`text-sm`, { color: secondaryTextColor }]}>{transaction.date.toDateString()} - {transaction.type}</Text>
        </View>
      </View>
      <Text style={[tw`text-xl font-bold`, { color: transaction.direction === "incoming" ? primaryColor : '#FF4136' }]}>
        {transaction.direction === "incoming" ? "+" : "-"}${transaction.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      </Text>
    </View>
  );

  const windowHeight = Dimensions.get('window').height;
  const bottomTabHeight = 112.5; // Adjust this value based on your BottomTab's actual height

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />
      <View style={tw`flex-1`}>
        <View style={tw`flex-row items-center justify-between px-4 py-6`}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2`}>
            <Icon name="arrow-left" size={28} color={textColor} />
          </TouchableOpacity>
          <Text style={titleStyle}>Transaction History</Text>
          <View style={tw`w-10`} />
        </View>
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: bottomTabHeight }}
          style={{ height: windowHeight - bottomTabHeight - 100 }} // Adjust 100 based on your header height
        />
      </View>
      <View style={[tw`absolute bottom-0 left-0 right-0`, { height: bottomTabHeight }]}>
        <BottomTab navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default TransactionHistory;