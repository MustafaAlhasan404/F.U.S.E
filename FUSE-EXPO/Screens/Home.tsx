import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, BackHandler, ScrollView, StatusBar, TouchableOpacity, FlatList, Dimensions, RefreshControl, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import BottomTab from '../Components/BottomTab';
import { useTheme } from '../ThemeContext';
import Icon from 'react-native-vector-icons/Feather';
import AccountCard from '../Components/AccountCard';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import axios from 'axios';
import baseUrl from "../baseUrl"
import { decryptData } from '../crypto-utils';

const Home = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const jwt = useSelector((state: RootState) => state.auth.jwt);
  const aesKey = useSelector((state: RootState) => state.auth.aesKey);
  const role = useSelector((state: RootState) => state.auth.role);
  const user = useSelector((state: RootState) => state.auth.user);

  const cardBackgroundColor = theme === 'light' ? '#F0F0F0' : '#424242';
  const borderColor = theme === 'light' ? '#CCCCCC' : '#444444';
  const placeholderColor = theme === 'light' ? '#999999' : '#A0A0A0';
  const buttonColor = theme === 'light' ? '#028174' : '#65e991';
  const buttonTextColor = theme === 'light' ? '#FFFFFF' : '#181E20';
  const linkColor = theme === 'light' ? '#028174' : '#65e991';

  const fetchUserData = async () => {
    try {
      const response = await axios.post(`${baseUrl}/account/user`, { jwt });
      const decryptedPayload = decryptData(response.data.payload, aesKey);
      // console.log(decryptedPayload);

      decryptedPayload.sort((a, b) => {
        if (a.type === "Checking" && b.type === "Savings") {
          return -1;
        } else if (a.type === "Savings" && b.type === "Checking") {
          return 1;
        } else {
          return a.id - b.id;
        }
      });
      setCards(decryptedPayload);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUnpaidBills = async () => {
    try {
      const response = await axios.post(`${baseUrl}/bill/unpaid`, { jwt });
      const decryptedPayload = decryptData(response.data.payload, aesKey);
      // console.log('Unpaid Bills:', decryptedPayload);
      setUnpaidBills(decryptedPayload);
    } catch (error) {
      console.error('Error fetching unpaid bills:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await axios.post(`${baseUrl}/user/expenses`, { jwt });
      const decryptedPayload = decryptData(response.data.payload, aesKey);
      // console.log('Expenses:', decryptedPayload.expenses);
      setExpenses(decryptedPayload.expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserData();
      if (role === "Merchant") {
        await fetchUnpaidBills();
      } else
        await fetchExpenses();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setRefreshing(false);
  }, [role]);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (role === "Merchant") {
      fetchUnpaidBills();
    } else
      fetchExpenses();
  }, [role]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonPress
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleBackButtonPress = () => {
    const navigationState = navigation.getState();
    const currentRouteName = navigationState.routes[navigationState.index].name;

    if (currentRouteName === 'Home') {
      return true;
    }

    return false;
  };

  const backgroundColor = theme === 'light' ? '#FFFFFF' : '#1A1A1A';
  const textColorClass = theme === 'light' ? 'text-gray-800' : 'text-white';
  const textColor = theme === 'light' ? '#333333' : '#DDDDDD';
  const iconColorClass = theme === 'light' ? 'black' : 'white';
  const statusBarStyle = theme === 'light' ? 'dark-content' : 'light-content';
  const primaryColor = theme === 'light' ? '#006e63' : '#65e991';


  const cardWidth = Dimensions.get('window').width * 0.85;
  const cardSpacing = 10;

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + cardSpacing));
    setCurrentIndex(index);
  };

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
        <ScrollView
          style={tw`flex-1 h-full`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme === 'light' ? 'black' : 'white']}
              tintColor={theme === 'light' ? 'black' : 'white'}
            />
          }
        >
          <View style={tw`flex-1 p-2`}>
            <Text style={tw`${textColorClass} text-2xl font-bold mb-5 ml-4 mt-5`}>Welcome, {user?.name}</Text>
            <View style={tw`w-full items-center`}>
              <FlatList
                data={cards}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={{ width: cardWidth, marginHorizontal: cardSpacing / 2 }}>
                    <AccountCard navigation={navigation} type={item.type} balance={item.balance} id={item.id} />
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
                snapToInterval={cardWidth + cardSpacing}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: cardSpacing / 2 }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              />
              <View style={tw`flex-row justify-center mt-4`}>
                {cards.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      tw`h-2 w-2 rounded-full mx-1`,
                      {
                        backgroundColor: currentIndex === index ? primaryColor : '#D3D3D3',
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
            <View style={tw`w-full flex-col items-center my-4`}>
              <View style={tw`w-full flex-row justify-evenly`}>
                <TouchableOpacity onPress={() => navigation.navigate("Pay")} style={tw`w-1/4 justify-center items-center py-3 rounded-lg`}>
                  <Icon name="credit-card" size={32} color={primaryColor} style={tw`pb-2`} />
                  <Text style={[tw`text-lg font-semibold`, { color: primaryColor }]}>Pay</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("Send")} style={tw`w-1/4 justify-center items-center py-3 rounded-lg`}>
                  <Icon name="send" size={32} color={primaryColor} style={tw`pb-2`} />
                  <Text style={[tw`text-lg font-semibold`, { color: primaryColor }]}>Send</Text>
                </TouchableOpacity>
                {role == "Merchant" &&
                  <TouchableOpacity onPress={() => navigation.navigate("IssueBill")} style={tw`w-1/4 justify-center items-center py-3 rounded-lg`}>
                    <Icon name="edit" size={32} color={primaryColor} style={tw`pb-2`} />
                    <Text style={[tw`text-lg font-semibold`, { color: primaryColor }]}>Issue Bill</Text>
                  </TouchableOpacity>}
              </View>
              {role == "Customer" &&
                <View style={tw`w-full flex-col justify-evenly mt-4`}>
                  <Text style={[tw`text-xl ml-4`, { color: textColor }]}>Latest Transactions</Text>
                  <ScrollView style={tw`w-full h-8/12`} contentContainerStyle={tw`w-full flex-col items-center`}>
                    {expenses.length > 0 && expenses.map((expense, index) => (
                      <TouchableOpacity key={index} onPress={() => { }}>
                        <View style={[tw`w-full flex-row justify-between items-center my-0.5 px-4 py-2 rounded-3xl bg-transparent border`, { borderColor: primaryColor }]}>
                          <View>
                            <Text style={[tw`text-base`, { color: theme === 'light' ? '#000000' : '#dedede' }]}>{new Date(expense.date).toDateString()}</Text>
                            <Text style={[tw`text-xl font-bold`, { color: theme === 'light' ? '#000000' : '#dedede' }]}>{expense.category}</Text>
                          </View>
                          <Text style={[tw`text-2xl font-bold`, { color: theme === 'light' ? '#000000' : '#dedede' }]}>${expense.amount}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              }
              {role == "Merchant" &&
                <View style={tw`w-full mt-6 px-4`}>
                  <View style={tw`flex-row justify-between items-center mb-4 mx-2`}>
                    <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>Pending Bills</Text>
                    <TouchableOpacity>
                      <Text style={[tw`text-base font-bold mr-1`, { color: primaryColor }]}>View All</Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    style={tw`flex-1`}
                    data={unpaidBills}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[tw`mb-3 mx-2 p-4 rounded-xl shadow-md`, { backgroundColor: cardBackgroundColor }]}
                        onPress={() => {/* Handle bill press */ }}
                      >
                        <View style={tw`flex-row justify-between items-center`}>
                          <View style={tw`flex-1 mr-4`}>
                            <Text style={[tw`text-lg font-semibold mb-1`, { color: textColor }]}>Bill #{item.id}</Text>
                            <Text style={[tw`text-sm`, { color: placeholderColor }]} numberOfLines={2} ellipsizeMode="tail">{item.details}</Text>
                          </View>
                          <View style={tw`items-end`}>
                            <Text style={[tw`text-xl font-bold`, { color: primaryColor }]}>${item.amount}</Text>
                            <Text style={[tw`text-xs mt-1`, { color: placeholderColor }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <View style={tw`flex-col justify-center items-center py-8`}>
                        <Icon name="file-text" size={48} color={placeholderColor} />
                        <Text style={[tw`text-lg mt-4`, { color: textColor }]}>No pending bills</Text>
                      </View>
                    }
                  />
                </View>
              }

            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomTab navigation={navigation} />
    </View>
  );

};

export default Home;
