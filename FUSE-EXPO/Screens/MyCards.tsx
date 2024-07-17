import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Modal, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import TextInput from '../Components/TextInput';
import tw from 'twrnc';
import BottomTab from '../Components/BottomTab';
import { useTheme } from '../ThemeContext';
import CreditCard from '../Components/CreditCard';
import Icon from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import axios from 'axios';
import baseUrl from '../baseUrl';
import { decryptData, encryptData } from '../crypto-utils';

import CartGlass1 from '../assets/Cart Glass 1.png';
import CartGlass3 from '../assets/Cart Glass 3.png';
import CartGlass7 from '../assets/Cart Glass 7.png';
import CartGlass8 from '../assets/Cart Glass 8.png';

const MyCards: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const jwt = useSelector((state: RootState) => state.auth.jwt);
  const aesKey = useSelector((state: RootState) => state.auth.aesKey);

  const [cards, setCards] = useState([]);
  const [card, setCard] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchCards = async () => {
    try {
      const response = await axios.post(`${baseUrl}/card/user`, { jwt });
      const decryptedPayload = decryptData(response.data.payload, aesKey);
      setCards(decryptedPayload);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCards();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchCards();
  }, []);

  const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
  const textColor = theme === 'light' ? '#333333' : '#DDDDDD';
  const cardBackgroundColor = theme === 'light' ? '#F0F0F0' : '#424242';
  const buttonBackgroundColor = theme === 'light' ? '#94B9C5' : '#94B9C5';
  const buttonTextColor = theme === 'light' ? '#FFFFFF' : '#181E20';
  const primaryColor = theme === 'light' ? '#006e63' : '#65e991';


  const [newCardModalVisible, setNewCardModalVisible] = useState<boolean>(false);
  const [showCreateCardInput, setShowCreateCardInput] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCreditCardResult, setShowCreateCardResult] = useState<boolean>(false);
  const [enterPIN, setEnterPIN] = useState<boolean>(false);
  const [confirmPIN, setConfirmPIN] = useState<boolean>(false);

  const [newCardName, setNewCardName] = useState<string>('');
  const [newCardBalance, setNewCardBalance] = useState<string>('');
  const [newCardPIN, setNewCardPIN] = useState<string>('');
  const [enteredPIN, setEnteredPIN] = useState<string>('');
  const [confirmedPIN, setConfirmedPIN] = useState<string>('');

  const resetNewCard = () => {
    setNewCardName('');
    setNewCardBalance('');
    setNewCardPIN('');
    setEnteredPIN('');
    setConfirmedPIN('');
    setShowCreateCardInput(true);
    setLoading(false);
    setShowCreateCardResult(false);
    setEnterPIN(false);
    setConfirmPIN(false);
    setNewCardModalVisible(false);
  };

  const AccountDetail = ({ title, content }: { title: string, content: string }) => (
    <View style={tw`pb-4 pl-4`}>
      <Text style={[tw`text-sm`, { color: textColor }]}>{title}</Text>
      <Text style={[tw`font-bold text-2xl tracking-wide`, { color: textColor }]}>{content}</Text>
    </View>
  );

  const lightBackgrounds = [CartGlass1, CartGlass3, CartGlass7, CartGlass8];
  const darkBackgrounds = [CartGlass1, CartGlass3, CartGlass7, CartGlass8];

  return (
    <View style={[tw`flex-col h-full justify-between`, { backgroundColor }]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />
      <View style={tw`flex-row justify-between items-center mt-4 mx-4 py-2`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-2`}>
            <Icon name="arrow-left" size={28} color={theme === 'light' ? '#000000' : '#FFFFFF'} />
          </TouchableOpacity>
          <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>My Cards</Text>
        </View>
        <TouchableOpacity onPress={() => setNewCardModalVisible(true)} style={tw`mr-2`}>
          <Icon name="plus" size={28} color={theme === 'light' ? '#000000' : '#FFFFFF'} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={tw`w-full h-12/15 p-2 mb-4`}
        contentContainerStyle={tw`w-full flex-col items-center`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme === 'light' ? 'black' : 'white']}
            tintColor={theme === 'light' ? 'black' : 'white'}
          />
        }
      >
        {cards.length === 0 && <Text style={[tw`text-lg pt-16`, { color: textColor }]}>You have no cards yet.</Text>}
        {cards.map((card, index) => {
          const backgroundImage = theme === 'light'
            ? lightBackgrounds[Math.floor(Math.random() * lightBackgrounds.length)]
            : darkBackgrounds[Math.floor(Math.random() * darkBackgrounds.length)];

          return (
            <TouchableOpacity key={index} onPress={() => {
              const cardNumber = card.id;
              navigation.navigate('CardDetails', { cardNumber });
            }}>
              <CreditCard
                id={card.id}
                name={card.cardName}
                balance={card.balance}
                cvv={card.cvv}
                expiry={card.expiryDate}
                backgroundImage={backgroundImage}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={newCardModalVisible}
        onRequestClose={() => {
          setNewCardModalVisible(!newCardModalVisible);
        }}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-90 h-full`}>
          <View style={[tw`w-11/12 p-5 rounded-xl h-auto flex-col items-center justify-between`, { backgroundColor: cardBackgroundColor }]}>
            {!showCreditCardResult && <View style={tw`flex-row justify-between items-center w-full mb-4`}>
              <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>
                Issue New Card
              </Text>
              <TouchableOpacity
                style={tw`p-2`}
                onPress={() => resetNewCard()}
              >
                <Icon name="x" size={28} color={textColor} />
              </TouchableOpacity>
            </View>}
            {/* Content */}
            {!loading && showCreateCardInput &&
              <View style={tw`w-full h-grow flex-col justify-between`}>
                <View>
                  <View style={tw`w-full`}>
                    <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor }]}>Card Name</Text>
                    <View style={tw`flex-row w-full justify-between`}>
                      <TextInput
                        style={[tw`flex-row w-grow mr-1 border-2 bg-transparent`, { borderColor: textColor, color: textColor }]}
                        onChangeText={(text: any) => {
                          setNewCardName(text);
                        }}
                        placeholder="e.g. Online Shopping / Groceries / etc..."
                        maxLength={25}
                        placeholderTextColor={textColor}
                      />
                    </View>
                  </View>
                  <View style={tw`mt-2`}>
                    <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor }]}>Initial Balance</Text>
                    <View style={tw`flex-row w-full justify-between`}>
                      <TextInput
                        style={[tw`flex-row w-grow mr-1 border-2 bg-transparent`, { borderColor: textColor, color: textColor }]}
                        onChangeText={(text: any) => {
                          setNewCardBalance(text);
                        }}
                        placeholder="SYP X,XXX"
                        maxLength={7}
                        keyboardType='numeric'
                        placeholderTextColor={textColor}
                      />
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[tw`flex-row justify-center items-center w-full mt-4`, { padding: 16, borderRadius: 8, backgroundColor: primaryColor }]}
                  onPress={() => {
                    if (newCardName.length < 1 || newCardBalance.length < 1) {
                      Alert.alert('Invalid Input', 'Please enter a card name and an initial balance', [{ text: 'OK' }], { cancelable: false });
                      return;
                    }
                    setShowCreateCardInput(false);
                    setEnterPIN(true);
                  }}
                >
                  <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            }
            {loading &&
              <View style={tw`w-full h-grow flex-col justify-center`}>
                <TouchableOpacity onPress={() => {
                  setLoading(false);
                  setShowCreateCardResult(true);
                }}>
                  <ActivityIndicator size="large" color={textColor} />
                </TouchableOpacity>
              </View>
            }

            {!loading && enterPIN &&
              <View style={tw`w-full h-grow flex-col justify-between`}>
                <View>
                  <View style={tw`mt-2`}>
                    <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor }]}>Enter PIN</Text>
                    <View style={tw`flex-row w-full justify-between`}>
                      <TextInput
                        style={[tw`flex-row w-grow mr-1 border-2 bg-transparent`, { borderColor: textColor, color: textColor }]}
                        onChangeText={(text: any) => {
                          setEnteredPIN(text);
                        }}
                        placeholder="XXXX"
                        maxLength={4}
                        keyboardType='numeric'
                        placeholderTextColor={textColor}
                        secureTextEntry={true}
                      />
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[tw`flex-row justify-center items-center w-full mt-4`, { padding: 16, borderRadius: 8, backgroundColor: primaryColor }]}
                  onPress={() => {
                    if (enteredPIN.length != 4) {
                      Alert.alert('Invalid PIN', 'Please enter a valid 4-digit PIN', [{ text: 'OK' }], { cancelable: false });
                      return;
                    }
                    setEnterPIN(false);
                    setConfirmPIN(true);
                  }}
                >
                  <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                    Enter PIN
                  </Text>
                </TouchableOpacity>
              </View>
            }

            {!loading && confirmPIN &&
              <View style={tw`w-full h-grow flex-col justify-between`}>
                <View>
                  <View style={tw`mt-2`}>
                    <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor }]}>Repeat PIN</Text>
                    <View style={tw`flex-row w-full justify-between`}>
                      <TextInput
                        style={[tw`flex-row w-grow mr-1 border-2 bg-transparent`, { borderColor: textColor, color: textColor }]}
                        onChangeText={(text: any) => {
                          setConfirmedPIN(text);
                        }}
                        placeholder="XXXX"
                        maxLength={4}
                        keyboardType='numeric'
                        placeholderTextColor={textColor}
                        secureTextEntry={true}
                      />
                    </View>
                    <TouchableOpacity style={tw`mt-2 w-full flex-row justify-center`} onPress={() => {
                      setConfirmPIN(false);
                      setEnterPIN(true);
                    }}>
                      <Text style={[tw`text-base`, { color: textColor }]}>Change PIN</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  style={[tw`flex-row justify-center items-center w-full mt-4`, { padding: 16, borderRadius: 8, backgroundColor: primaryColor }]}
                  onPress={async () => {
                    if (confirmedPIN.length != 4) {
                      Alert.alert('Invalid PIN', 'Please enter a valid 4-digit PIN', [{ text: 'OK' }], { cancelable: false });
                      return;
                    } else if (enteredPIN != confirmedPIN) {
                      Alert.alert('Error', 'PIN\'s don\'t match', [{ text: 'OK' }], { cancelable: false });
                      return;
                    }

                    setLoading(true); // Start loading

                    try {
                      const response = await axios.post(`${baseUrl}/card`, {
                        jwt,
                        payload: encryptData({
                          cardName: newCardName,
                          balance: parseFloat(newCardBalance),
                          PIN: enteredPIN,
                          rPIN: confirmedPIN,
                        }, aesKey)
                      });

                      const decryptedPayload = decryptData(response.data.payload, aesKey);
                      console.log(decryptedPayload);
                      if (response.status == 200) {
                        setConfirmPIN(false);
                        setCard(decryptedPayload);
                        setShowCreateCardResult(true);
                      } else {
                        Alert.alert('Error', 'Something went wrong', [{ text: 'OK' }], { cancelable: false });
                      }
                    } catch (error: any) {
                      Alert.alert('Error', error.message || 'Something went wrong', [{ text: 'OK' }], { cancelable: false });
                    } finally {
                      setLoading(false); // Stop loading
                    }
                  }}
                >
                  <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                    Issue Card
                  </Text>
                </TouchableOpacity>
              </View>
            }

            {!loading && showCreditCardResult &&
              <View style={tw`w-full h-grow flex-col justify-between`}>
                <View>
                  <View style={tw`w-full`}>
                    <View style={tw`w-full flex-row justify-between items-center mb-2`}>
                      <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>Card Created Successfully</Text>
                      <Icon name="check" size={28} color={textColor} />
                    </View>
                    <View style={tw`w-full flex-row justify-center pb-2`}>
                      <View style={[tw`w-full border h-0`, { borderColor: textColor }]} />
                    </View>
                    <AccountDetail title='Card Number' content={card.id.replace(/(.{4})/g, '$1  ').trim()} />
                    <AccountDetail title='Card Name' content={card.cardName} />
                    <AccountDetail title='Card Balance' content={card.balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
                    <View style={tw`flex-row justify-start items-center`}>
                      <View style={tw`w-1/2`}>
                        <AccountDetail title='CVV' content={card.cvv} />
                      </View>
                      <AccountDetail title='Expiry' content={`${new Date(card.expiryDate).getMonth() + 1}/${new Date(card.expiryDate).getFullYear()}`} />
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[tw`flex-row justify-center items-center border-2 w-full`, { borderColor: textColor, padding: 16, borderRadius: 8 }]}
                  onPress={() => {
                    resetNewCard();
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Home' }],
                    });
                  }}
                >
                  <Text style={[tw`text-base font-bold ml-2`, { color: textColor }]}>
                    Back to Home
                  </Text>
                </TouchableOpacity>
              </View>
            }
          </View>
        </View>
      </Modal>
      <BottomTab navigation={navigation} />
    </View>
  );
};

export default MyCards;
