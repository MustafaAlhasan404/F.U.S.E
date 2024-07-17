import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, BackHandler, ScrollView, StatusBar, TouchableOpacity, FlatList, Dimensions, RefreshControl,SafeAreaView } from 'react-native';
import tw from 'twrnc';
import { useTheme } from '../ThemeContext';
import Icon from 'react-native-vector-icons/Feather';
import AccountCard from '../Components/AccountCard';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import axios from 'axios';
import baseUrl from "../baseUrl"
import { decryptData } from '../crypto-utils';
import { Button } from '@rneui/base';

const Home = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const jwt = useSelector((state: RootState) => state.auth.jwt);
  const aesKey = useSelector((state: RootState) => state.auth.aesKey);
  const role = useSelector((state: RootState) => state.auth.role);
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchUserData = async () => {
    try {
      const response = await axios.post(`${baseUrl}/account/user`, { jwt });
      const decryptedPayload = decryptData(response.data.payload, aesKey);
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
      console.log('Unpaid Bills:', decryptedPayload);
      setUnpaidBills(decryptedPayload);
    } catch (error) {
      console.error('Error fetching unpaid bills:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserData();
      if (role === "Merchant") {
        await fetchUnpaidBills();
      }
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
    }
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

  const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
  const textColorClass = theme === 'light' ? 'text-gray-800' : 'text-white';
  const textColor = theme === 'light' ? '#333333' : '#DDDDDD';
  const iconColorClass = theme === 'light' ? 'white' : 'black';
  const statusBarStyle = theme === 'light' ? 'dark-content' : 'light-content';
  const primaryColor = theme === 'light' ? '#006e63' : '#65e991';

  const cardWidth = Dimensions.get('window').width * 0.85;
  const cardSpacing = 10;

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + cardSpacing));
    setCurrentIndex(index);
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}> 
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      <ScrollView
       contentContainerStyle={tw`pb-20`}
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
          <View style={tw`flex-row justify-between items-center ml-4 mr-1`}>
            <Text style={tw`${textColorClass} text-2xl font-bold mt-5 mb-6`}>Welcome, {user?.name}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Icon name="settings" size={24} color={primaryColor} />
            </TouchableOpacity>
          </View>
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
              <TouchableOpacity 
                onPress={() => navigation.navigate("Send")} 
                style={[tw`w-3/4 justify-center items-center py-3 rounded-lg`, { backgroundColor: primaryColor }]} // Adjusted width to w-3/4
              >
                <Icon name="send" size={32} color={iconColorClass} style={tw`pb-2`} />
                <Text style={[tw`text-lg font-semibold`, { color: iconColorClass }]}>Send</Text>
              </TouchableOpacity>
              {role == "Merchant" &&
                <TouchableOpacity onPress={() => navigation.navigate("IssueBill")} style={tw`w-1/4 justify-center items-center py-3 rounded-lg`}>
                  <Icon name="edit" size={32} color={primaryColor} style={tw`pb-2`} />
                  <Text style={[tw`text-lg font-semibold`, { color: primaryColor }]}>Issue Bill</Text>
                </TouchableOpacity>}
            </View>
            {role == "Customer" &&
              <View style={tw`w-full flex-col justify-evenly items-center mt-4 bg-black`}>
                <Text style={tw`text-white text-base`}>Customer Transactions Goes Here</Text>
                <ScrollView style={tw`w-full h-8/12`} contentContainerStyle={tw`w-full flex-col items-center`}>
                  {cards.map((card, index) => (
                    <TouchableOpacity key={index} onPress={() => { }}>
                      <Text style={tw`text-white text-base`}>Transaction #{index}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            }
            {role == "Merchant" &&
              <View style={tw`w-full flex-col justify-evenly items-center mt-4`}>
                <View style={tw`w-full flex-row justify-between px-4 items-center`}>
                  <Text style={[tw`text-xl font-bold`, { color: textColor }]}>Bills (Pending)</Text>
                </View>
                <ScrollView style={tw`w-full h-7/12 pt-4`} contentContainerStyle={tw`w-full flex-col items-center`}>
                  {unpaidBills.length > 0 && unpaidBills.map((bill, index) => (
                    <TouchableOpacity style={tw`w-full`} key={index} onPress={() => { }}>
                      <View style={tw`w-full flex-row justify-between px-4 py-6 my-1 rounded-xl bg-black`}>
                        <Text style={tw`text-white text-base`}>Bill #{bill.id}</Text>
                        <Text style={tw`text-white text-base`}>{bill.details}</Text>
                        <Text style={tw`text-white text-base`}>{bill.amount}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {unpaidBills.length == 0 &&
                    <View style={tw`h-full flex-col justify-center items-center pt-8`}>
                      <Text style={[tw`text-lg`, { color: textColor }]}>You have no pending bills</Text>
                    </View>
                  }
                </ScrollView>
              </View>
            }
          </View>
        </View>
      </ScrollView>
      </SafeAreaView> 
  );
};

export default Home;
