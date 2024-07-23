import React, { useEffect, useState, useCallback } from 'react';
import {
  TouchableWithoutFeedback,
  SafeAreaView,
  Keyboard,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
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
import { BlurView } from 'expo-blur';
import CartGlass8 from '../assets/Cart Glass 8.png';

const MyCards: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Theme and Redux state
  const { theme } = useTheme();
  const jwt = useSelector((state: RootState) => state.auth.jwt);
  const aesKey = useSelector((state: RootState) => state.auth.aesKey);

  // State variables
  const [cards, setCards] = useState([]);
  const [card, setCard] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [newCardModalVisible, setNewCardModalVisible] = useState<boolean>(false);
  const [showCreateCardInput, setShowCreateCardInput] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCreditCardResult, setShowCreateCardResult] = useState<boolean>(false);
  const [enterPIN, setEnterPIN] = useState<boolean>(false);
  const [confirmPIN, setConfirmPIN] = useState<boolean>(false);

  // New card input states
  const [newCardName, setNewCardName] = useState<string>('');
  const [newCardBalance, setNewCardBalance] = useState<string>('');
  const [newCardPIN, setNewCardPIN] = useState<string>('');
  const [enteredPIN, setEnteredPIN] = useState<string>('');
  const [confirmedPIN, setConfirmedPIN] = useState<string>('');

  // Animation state for modal
  const [modalAnimation] = useState(new Animated.Value(0));

  // Card background
  const cardBackground = CartGlass8;

  // Theme-based color definitions
  const backgroundColor = theme === 'light' ? '#FFFFFF' : '#1A1A1A';
  const textColor = theme === 'light' ? '#333333' : '#FFFFFF';
  const cardBackgroundColor = theme === 'light' ? '#F0F0F0' : '#2A2A2A';
  const buttonBackgroundColor = theme === 'light' ? '#028174' : '#65e991';
  const buttonTextColor = theme === 'light' ? '#FFFFFF' : '#181E20';

  // Fetch cards function
  const fetchCards = async () => {
    try {
      const response = await axios.post(`${baseUrl}/card/user`, { jwt });
      const decryptedPayload = decryptData(response.data.payload, aesKey);
      setCards(decryptedPayload);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCards();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setRefreshing(false);
  }, []);

  // Fetch cards on component mount
  useEffect(() => {
    fetchCards();
  }, []);

  // Reset new card form function
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

  // Account detail component
  const AccountDetail = ({ title, content }: { title: string, content: string }) => (
    <View style={tw`pb-4 pl-4`}>
      <Text style={[tw`text-sm`, { color: textColor, fontFamily: 'Poppins-Regular' }]}>{title}</Text>
      <Text style={[tw`font-bold text-2xl tracking-wide`, { color: textColor, fontFamily: 'Poppins-Bold' }]}>{content}</Text>
    </View>
  );

  // Modal animation function
  const animateModal = (toValue: number) => {
    Animated.spring(modalAnimation, {
      toValue,
      useNativeDriver: true,
    }).start();
  };

  // Trigger modal animation when visibility changes
  useEffect(() => {
    if (newCardModalVisible) {
      animateModal(1);
    } else {
      animateModal(0);
    }
  }, [newCardModalVisible]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1, backgroundColor }}>
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
          <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />

          {/* Header */}
          <View style={tw`flex-row justify-between items-center mt-6 mx-6 py-4`}>
            <View style={tw`flex-row items-center`}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-4`}>
                <Icon name="arrow-left" size={28} color={textColor} />
              </TouchableOpacity>
              <Text style={[tw`text-3xl font-bold`, { color: textColor, fontFamily: 'Poppins-Bold' }]}>My Cards</Text>
            </View>
            <TouchableOpacity
              onPress={() => setNewCardModalVisible(true)}
              style={[tw`mr-2 p-3 rounded-full`, { backgroundColor: buttonBackgroundColor }]}
            >
              <Icon name="plus" size={24} color={buttonTextColor} />
            </TouchableOpacity>
          </View>

          {/* Card List */}
          <ScrollView
            style={tw`w-full h-12/15 px-6 mb-6`}
            contentContainerStyle={tw`w-full flex-col items-center py-6`}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[textColor]}
                tintColor={textColor}
              />
            }
          >
            {cards.length === 0 && (
              <Text style={[tw`text-xl pt-20`, { color: textColor, fontFamily: 'Poppins-Regular' }]}>
                You have no cards yet.
              </Text>
            )}
            {cards.map((card, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  const cardNumber = card.id;
                  navigation.navigate('CardDetails', { cardNumber });
                }}
                style={tw`shadow-lg mb-6`}
              >
                <Animated.View style={[
                  tw`shadow-lg rounded-xl overflow-hidden`,
                  {
                    transform: [{ scale: 1 }],
                  }
                ]}>
                  <CreditCard
                    id={card.id}
                    name={card.cardName}
                    balance={card.balance}
                    cvv={card.cvv}
                    expiry={card.expiryDate}
                    backgroundImage={cardBackground}
                  />
                </Animated.View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* New Card Modal */}
          <Modal
            animationType="none"
            transparent={true}
            visible={newCardModalVisible}
            onRequestClose={() => {
              setNewCardModalVisible(false);
            }}
          >
            <BlurView
              style={tw`flex-1 justify-center items-center`}
              blurType={theme === 'light' ? 'light' : 'dark'}
              blurAmount={10}
            >
              <Animated.View
                style={[
                  tw`w-11/12 p-6 rounded-2xl h-auto flex-col items-center justify-between`,
                  {
                    backgroundColor: cardBackgroundColor,
                    transform: [
                      {
                        translateY: modalAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [300, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {!showCreditCardResult && (
                  <View style={tw`flex-row justify-between items-center w-full mb-4`}>
                    <Text style={[tw`text-2xl font-bold`, { color: textColor, fontFamily: 'Poppins-Bold' }]}>
                      Issue New Card
                    </Text>
                    <TouchableOpacity
                      style={tw`p-2`}
                      onPress={() => resetNewCard()}
                    >
                      <Icon name="x" size={28} color={textColor} />
                    </TouchableOpacity>
                  </View>
                )}

                {/* New Card Input Form */}
                {!loading && showCreateCardInput && (
                  <View style={tw`w-full h-grow flex-col justify-between`}>
                    <View>
                      <View style={tw`w-full mb-4`}>
                        <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor, fontFamily: 'Poppins-Regular' }]}>Card Name</Text>
                        <View style={tw`flex-row w-full justify-between`}>
                          <TextInput
                            style={[tw`flex-row w-grow mr-1 border-2 bg-transparent rounded-lg px-3 py-2`, { borderColor: textColor, color: textColor }]}
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
                        <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor, fontFamily: 'Poppins-Regular' }]}>Initial Balance</Text>
                        <View style={tw`flex-row w-full justify-between`}>
                          <TextInput
                            style={[tw`flex-row w-grow mr-1 border-2 bg-transparent rounded-lg px-3 py-2`, { borderColor: textColor, color: textColor }]}
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
                      style={[tw`flex-row justify-center items-center w-full mt-4 rounded-lg`, { padding: 16, backgroundColor: buttonBackgroundColor }]}
                      onPress={() => {
                        if (newCardName.length < 1 || newCardBalance.length < 1) {
                          Alert.alert('Invalid Input', 'Please enter a card name and an initial balance', [{ text: 'OK' }], { cancelable: false });
                          return;
                        }
                        setShowCreateCardInput(false);
                        setEnterPIN(true);
                      }}
                    >
                      <Text style={[tw`text-base font-bold`, { color: buttonTextColor, fontFamily: 'Poppins-Bold' }]}>
                        Next
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Loading Indicator */}
                {loading && (
                  <View style={tw`w-full h-grow flex-col justify-center items-center`}>
                    <ActivityIndicator size="large" color={textColor} />
                  </View>
                )}

                {/* PIN Entry */}
                {!loading && enterPIN && (
                  <View style={tw`w-full h-grow flex-col justify-between`}>
                    <View>
                      <View style={tw`mt-2`}>
                        <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor, fontFamily: 'Poppins-Regular' }]}>Enter PIN</Text>
                        <View style={tw`flex-row w-full justify-between`}>
                          <TextInput
                            style={[tw`flex-row w-grow mr-1 border-2 bg-transparent rounded-lg px-3 py-2`, { borderColor: textColor, color: textColor }]}
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
                      style={[tw`flex-row justify-center items-center w-full mt-4 rounded-lg`, { padding: 16, backgroundColor: buttonBackgroundColor }]}
                      onPress={() => {
                        if (enteredPIN.length != 4) {
                          Alert.alert('Invalid PIN', 'Please enter a valid 4-digit PIN', [{ text: 'OK' }], { cancelable: false });
                          return;
                        }
                        setEnterPIN(false);
                        setConfirmPIN(true);
                      }}
                    >
                      <Text style={[tw`text-base font-bold`, { color: buttonTextColor, fontFamily: 'Poppins-Bold' }]}>
                        Enter PIN
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* PIN Confirmation */}
                {!loading && confirmPIN && (
                  <View style={tw`w-full h-grow flex-col justify-between`}>
                    <View>
                      <View style={tw`mt-2`}>
                        <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor, fontFamily: 'Poppins-Regular' }]}>Repeat PIN</Text>
                        <View style={tw`flex-row w-full justify-between`}>
                          <TextInput
                            style={[tw`flex-row w-grow mr-1 border-2 bg-transparent rounded-lg px-3 py-2`, { borderColor: textColor, color: textColor }]}
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
                          <Text style={[tw`text-base`, { color: textColor, fontFamily: 'Poppins-Regular' }]}>Change PIN</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[tw`flex-row justify-center items-center w-full mt-4 rounded-lg`, { padding: 16, backgroundColor: buttonBackgroundColor }]}
                      onPress={async () => {
                        if (confirmedPIN.length != 4) {
                          Alert.alert('Invalid PIN', 'Please enter a valid 4-digit PIN', [{ text: 'OK' }], { cancelable: false });
                          return;
                        } else if (enteredPIN != confirmedPIN) {
                          Alert.alert('Error', 'PINs don\'t match', [{ text: 'OK' }], { cancelable: false });
                          return;
                        }

                        setLoading(true);

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
                          setLoading(false);
                        }
                      }}
                    >
                      <Text style={[tw`text-base font-bold`, { color: buttonTextColor, fontFamily: 'Poppins-Bold' }]}>
                        Issue Card
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Card Creation Result */}
                {!loading && showCreditCardResult && (
                  <View style={tw`w-full h-grow flex-col justify-between`}>
                    <View>
                      <View style={tw`w-full`}>
                        <View style={tw`w-full flex-row justify-between items-center mb-2`}>
                          <Text style={[tw`text-2xl font-bold`, { color: textColor, fontFamily: 'Poppins-Bold' }]}>Card Created Successfully</Text>
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
                      style={[tw`flex-row justify-center items-center w-full mt-4 rounded-lg`, { padding: 16, backgroundColor: buttonBackgroundColor }]}
                      onPress={() => {
                        resetNewCard();
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Home' }],
                        });
                      }}
                    >
                      <Text style={[tw`text-base font-bold`, { color: buttonTextColor, fontFamily: 'Poppins-Bold' }]}>
                        Back to Home
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            </BlurView>
          </Modal>
        </SafeAreaView>
        <BottomTab navigation={navigation} />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default MyCards;