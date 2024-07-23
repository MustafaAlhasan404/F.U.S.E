import React, { useEffect, useState } from 'react';
import { Platform, View, Text, TouchableOpacity, ScrollView, StatusBar, Modal, ActivityIndicator, Alert, Keyboard, TouchableWithoutFeedback, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import tw from 'twrnc';
import BottomTab from '../Components/BottomTab';
import { useTheme } from '../ThemeContext';
import Icon from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import axios from 'axios';
import baseUrl from '../baseUrl';
import { decryptData, encryptData } from '../crypto-utils';
// import NfcManager, { NfcTech, NfcEvents, TagEvent, Ndef } from 'react-native-nfc-manager';
import TextInput from '../Components/TextInput';

const CardDetails: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const { cardNumber } = route.params; // Retrieve the cardNumber parameter

    const { theme } = useTheme();
    const jwt = useSelector((state: RootState) => state.auth.jwt);
    const aesKey = useSelector((state: RootState) => state.auth.aesKey);

    const [card, setCard] = useState({});

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axios.post(`${baseUrl}/card/${cardNumber}`, { jwt });
                const decryptedPayload = decryptData(response.data.payload, aesKey);
                setCard(decryptedPayload);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchDetails();
    }, []);

    const backgroundColor = theme === 'light' ? '#FFFFFF' : '#1A1A1A';
    const textColor = theme === 'light' ? '#1F1F1F' : '#FFFFFF';
    const borderColor = theme === 'light' ? '#CCCCCC' : '#444444';
    const placeholderColor = theme === 'light' ? '#999999' : '#A0A0A0';
    const buttonColor = theme === 'light' ? '#028174' : '#65e991';
    const buttonTextColor = theme === 'light' ? '#FFFFFF' : '#181E20';
    const linkColor = theme === 'light' ? '#028174' : '#92DE8B';
    const cardBackgroundColor = theme === 'light' ? '#F0F0F0' : '#424242';

    const [loading, setLoading] = useState<boolean>(false);

    const [deleteCardModalVisible, setDeleteCardModalVisible] = useState<boolean>(false);
    const [cardDeleteSuccess, setCardDeleteSuccess] = useState<boolean>(false);

    const [changePINModalVisible, setChangePINModalVisible] = useState<boolean>(false);
    const [newPIN, setNewPIN] = useState<string>('');
    const [confirmNewPIN, setConfirmNewPIN] = useState<string>('');
    const [changePINSuccess, setChangePINSuccess] = useState<boolean>(false);

    const [topupModalVisible, setTopupModalVisible] = useState<boolean>(false);
    const [topupAmount, setTopupAmount] = useState<string>("");
    const [topupSuccess, setTopupSuccess] = useState<boolean>(false);

    const [withdrawModalVisible, setWithdrawModalVisible] = useState<boolean>(false);
    const [withdrawAmount, setWithdrawAmount] = useState<string>("");
    const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);

    const [nfcModalVisible, setNfcModalVisible] = useState<boolean>(false);
    const [nfcTagDetected, setNfcTagDetected] = useState<boolean>(false);
    const [nfcTagDetails, setNfcTagDetails] = useState<string>('');
    const [nfcWriteSuccess, setNfcWriteSuccess] = useState<boolean>(false);

    const AccountDetail = ({ title, content }: { title: string, content: string }) => (
        <View style={tw`pb-4 pl-4`}>
            <Text style={[tw`text-sm`, { color: textColor }]}>{title}</Text>
            <Text style={[tw`font-bold text-2xl tracking-wide`, { color: textColor }]}>{content}</Text>
        </View>
    );

    // const handleNfcWrite = async () => {
    //     try {
    //         const cardToWrite = {
    //             id: card.id,
    //             expiryDate: card.expiryDate,
    //             cvv: card.cvv,
    //         }
    //         setLoading(true);
    //         await NfcManager.requestTechnology(NfcTech.Ndef);
    //         const bytes = Ndef.encodeMessage([Ndef.textRecord(JSON.stringify(cardToWrite))]);
    //         if (bytes) {
    //             await NfcManager.ndefHandler.writeNdefMessage(bytes);
    //             setNfcWriteSuccess(true);
    //             Alert.alert('Success', 'Card details written to NFC tag successfully.');
    //         }
    //     } catch (ex) {
    //         console.warn(ex);
    //         Alert.alert('Error', 'Failed to write to NFC tag.');
    //     } finally {
    //         setLoading(false);
    //         NfcManager.cancelTechnologyRequest();
    //     }
    // };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, backgroundColor }}>
                <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
                    <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={tw`flex-1`}
                    >
                        <ScrollView contentContainerStyle={tw`grow`}>
                            <View>
                                <View style={tw`flex-row justify-between items-center mt-4 mx-4 py-2`}>
                                    <View style={tw`flex-row items-center`}>
                                        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-2`}>
                                            <Icon name="arrow-left" size={28} color={theme === 'light' ? '#000000' : '#FFFFFF'} />
                                        </TouchableOpacity>
                                        <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>Card Details</Text>
                                    </View>
                                </View>
                                {Object.keys(card).length > 0 &&
                                    <View style={tw`mt-8`}>
                                        <AccountDetail title="Card Name" content={card.cardName} />
                                        <AccountDetail title="Card Number" content={card.id.replace(/(.{4})/g, '$1  ').trim()} />
                                        <AccountDetail title="Card Balance" content={`SYP ${card.balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`} />
                                        <AccountDetail title="Expiry Date" content={`${new Date(card.expiryDate).getMonth() + 1}/${new Date(card.expiryDate).getFullYear()}`} />
                                        <AccountDetail title="CVV" content={card.cvv} />
                                        <AccountDetail title="Issue Date Date" content={`${new Date(card.createdAt).getMonth() + 1}/${new Date(card.createdAt).getFullYear()}`} />

                                        <View style={tw`w-full px-2 mt-8`}>
                                            <View style={tw`flex-row justify-center items-center`}>
                                                <TouchableOpacity
                                                    style={[tw`flex-row justify-center items-center w-grow m-1 py-4 rounded-lg`, { backgroundColor: buttonColor }]}
                                                    onPress={() => {
                                                        setTopupModalVisible(true);
                                                    }}
                                                >
                                                    <Icon name="plus" size={20} color={buttonTextColor} />
                                                    <Text style={[tw`text-lg font-bold ml-1`, { color: buttonTextColor }]}>Topup</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[tw`flex-row justify-center items-center w-grow m-1 py-4 rounded-lg`, { backgroundColor: buttonColor }]}
                                                    onPress={() => {
                                                        setWithdrawModalVisible(true);
                                                    }}
                                                >
                                                    <Icon name="minus" size={20} color={buttonTextColor} />
                                                    <Text style={[tw`text-lg font-bold ml-1`, { color: buttonTextColor }]}>Withdraw</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={tw`flex-row justify-center items-center`}>
                                                <TouchableOpacity
                                                    style={[tw`flex-row justify-center items-center w-grow m-1 py-4 rounded-lg`, { backgroundColor: buttonColor }]}
                                                    onPress={() => { setChangePINModalVisible(true); }}
                                                >
                                                    <Icon name="edit-2" size={20} color={buttonTextColor} />
                                                    <Text style={[tw`text-lg font-bold ml-1`, { color: buttonTextColor }]}>Change PIN</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[tw`flex-row justify-center items-center w-grow m-1 py-4 rounded-lg`, { backgroundColor: buttonColor }]}
                                                    onPress={() => { setDeleteCardModalVisible(true); }}
                                                >
                                                    <Icon name="trash" size={20} color={buttonTextColor} />
                                                    <Text style={[tw`text-lg font-bold ml-1`, { color: buttonTextColor }]}>Cancel Card</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={tw`flex-row justify-center items-center`}>
                                                {/* <TouchableOpacity
                                                    style={[tw`flex-row justify-center items-center w-grow m-1 py-4 rounded-lg`, { backgroundColor: buttonColor }]}
                                                    onPress={() => {
                                                        // handleNfcWrite();
                                                        setNfcModalVisible(true);
                                                    }}
                                                >
                                                    <Icon name="wifi" size={20} color={buttonTextColor} />
                                                    <Text style={[tw`text-lg font-bold ml-1`, { color: buttonTextColor }]}>Create Digital Card</Text>
                                                </TouchableOpacity> */}
                                            </View>
                                        </View>
                                    </View>
                                }
                            </View>
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={deleteCardModalVisible}
                                onRequestClose={() => {
                                    setDeleteCardModalVisible(!deleteCardModalVisible);
                                }}
                            >
                                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-90 h-full`}>
                                    <View style={[tw`w-11/12 p-5 rounded-xl h-3/6 flex-col items-center justify-between`, { backgroundColor: cardBackgroundColor }]}>
                                        <View style={tw`flex-row justify-between items-center w-full mb-4`}>
                                            <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>
                                                Delete Card
                                            </Text>
                                            <TouchableOpacity
                                                style={tw`p-2`}
                                                onPress={() => setDeleteCardModalVisible(false)}
                                            >
                                                <Icon name="x" size={28} color={textColor} />
                                            </TouchableOpacity>
                                        </View>
                                        {!loading && !cardDeleteSuccess &&
                                            <View style={tw`w-full h-grow flex-col justify-between`}>
                                                <View style={tw`w-full flex-col items-center justify-center`}>
                                                    <Icon name={"alert-triangle"} size={100} color={textColor} />
                                                    <Text style={[tw`text-2xl font-bold text-center`, { color: textColor }]}>
                                                        Are you sure you want to delete this card?
                                                    </Text>
                                                    <Text style={[tw`text-base font-bold mt-2 text-center`, { color: textColor }]}>
                                                        This action cannot be undone
                                                    </Text>
                                                </View>
                                                <View>
                                                    <TouchableOpacity
                                                        style={[tw`flex-row justify-center items-center`, { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }]}
                                                        onPress={async () => {
                                                            setLoading(true);

                                                            try {
                                                                const response = await axios.delete(`${baseUrl}/card/${cardNumber}`, {
                                                                    data: {
                                                                        jwt: jwt
                                                                    }
                                                                });

                                                                const decryptedPayload = decryptData(response.data.payload, aesKey);
                                                                console.log(decryptedPayload);
                                                                if (response.status == 200) {
                                                                    setCardDeleteSuccess(true);
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
                                                        <Icon name={"trash"} size={20} color={buttonTextColor} />
                                                        <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                                                            Delete Card
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setDeleteCardModalVisible(false);
                                                        }}
                                                    >
                                                        <Text style={[tw`text-base font-bold mt-1 text-center`, { color: textColor }]}>
                                                            Keep this card
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        }
                                        {loading &&
                                            <View style={tw`w-full h-grow flex-col justify-center`}>
                                                <ActivityIndicator size="large" color={textColor} />
                                            </View>
                                        }
                                        {!loading && cardDeleteSuccess &&
                                            <View style={tw`w-full h-grow flex-col justify-between`}>
                                                <View style={tw`w-full flex-col items-center justify-center mt-8`}>
                                                    <Icon name={"trash"} size={100} color={textColor} />
                                                    <Text style={[tw`text-2xl font-bold text-center mt-2`, { color: textColor }]}>
                                                        Card Deleted
                                                    </Text>
                                                    <Text style={[tw`text-2xl font-bold text-center`, { color: textColor }]}>
                                                        Successfully
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={[tw`flex-row justify-center items-center`, { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }]}
                                                    onPress={async () => {
                                                        setDeleteCardModalVisible(false);
                                                        navigation.reset({
                                                            index: 0,
                                                            routes: [{ name: 'Home' }],
                                                        });
                                                    }}
                                                >
                                                    <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                                                        Back to Home
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        }
                                    </View>
                                </View>
                            </Modal>

                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={changePINModalVisible}
                                onRequestClose={() => {
                                    setChangePINModalVisible(!changePINModalVisible);
                                }}
                            >
                                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-90 h-full`}>
                                    <View style={[tw`w-11/12 p-5 rounded-xl h-3/6 flex-col items-center justify-between`, { backgroundColor: cardBackgroundColor }]}>
                                        {<View style={tw`flex-row justify-between items-center w-full mb-4`}>
                                            <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>
                                                Change Card PIN
                                            </Text>
                                            <TouchableOpacity
                                                style={tw`p-2`}
                                                onPress={() => setChangePINModalVisible(false)}
                                            >
                                                <Icon name="x" size={28} color={textColor} />
                                            </TouchableOpacity>
                                        </View>}
                                        {!loading && !changePINSuccess &&
                                            <View style={tw`w-full h-grow flex-col justify-between`}>
                                                <View style={tw`w-full flex-col items-center justify-center`}>
                                                    <View style={tw`w-full`}>
                                                        <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor }]}>New PIN</Text>
                                                        <View style={tw`flex-row w-full justify-between`}>
                                                            <TextInput
                                                                style={[tw`flex-row w-grow mr-1 border-2 bg-transparent`, { borderColor: textColor, color: textColor }]}
                                                                onChangeText={(text: any) => {
                                                                    setNewPIN(text);
                                                                }}
                                                                placeholder="XXXX"
                                                                maxLength={4}
                                                                value={newPIN}
                                                                keyboardType='numeric'
                                                                placeholderTextColor={textColor}
                                                                secureTextEntry={true}
                                                            />
                                                        </View>
                                                    </View>
                                                    <View style={tw`w-full`}>
                                                        <Text style={[tw`text-sm pl-2 pb-1 mt-4`, { color: textColor }]}>Confirm New PIN</Text>
                                                        <View style={tw`flex-row w-full justify-between`}>
                                                            <TextInput
                                                                style={[tw`flex-row w-grow mr-1 border-2 bg-transparent`, { borderColor: textColor, color: textColor }]}
                                                                onChangeText={(text: any) => {
                                                                    setConfirmNewPIN(text);
                                                                }}
                                                                placeholder="XXXX"
                                                                maxLength={4}
                                                                value={confirmNewPIN}
                                                                keyboardType='numeric'
                                                                placeholderTextColor={textColor}
                                                                secureTextEntry={true}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>
                                                <View>
                                                    <TouchableOpacity
                                                        style={[tw`flex-row justify-center items-center`, { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }]}
                                                        onPress={async () => {
                                                            if (newPIN.length != 4 || confirmNewPIN.length != 4 || newPIN != confirmNewPIN) {
                                                                Alert.alert('Error', 'Please enter matching 4-digit PINs');
                                                                return;
                                                            }

                                                            setLoading(true);

                                                            try {

                                                                const response = await axios.put(`${baseUrl}/card/pin/${cardNumber}`, {
                                                                    jwt,
                                                                    payload: encryptData({
                                                                        PIN: newPIN,
                                                                        rPIN: confirmNewPIN
                                                                    }, aesKey)
                                                                });

                                                                const decryptedPayload = decryptData(response.data.payload, aesKey);
                                                                console.log(decryptedPayload);
                                                                if (response.status == 200) {
                                                                    setChangePINSuccess(true);
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
                                                        <Text style={[tw`text-base font-bold ml-2`, {
                                                            color: buttonTextColor
                                                        }]}>
                                                            Change PIN
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        }

                                        {loading &&
                                            <View style={tw`w-full h-grow flex-col justify-center`}>
                                                <ActivityIndicator size="large" color={textColor} />
                                            </View>
                                        }

                                        {!loading && changePINSuccess &&
                                            <View style={tw`w-full h-grow flex-col justify-between`}>
                                                <View style={tw`w-full flex-col items-center justify-center mt-8`}>
                                                    <Icon name={"check"} size={100} color={textColor} />
                                                    <Text style={[tw`text-2xl font-bold text-center mt-2`, { color: textColor }]}>
                                                        PIN Changed
                                                    </Text>
                                                    <Text style={[tw`text-2xl font-bold text-center`, { color: textColor }]}>
                                                        Successfully
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={[tw`flex-row justify-center items-center`, { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }]}
                                                    onPress={async () => {
                                                        setChangePINModalVisible(false);
                                                        navigation.reset({
                                                            index: 0,
                                                            routes: [{ name: 'Home' }],
                                                        });
                                                    }}
                                                >
                                                    <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                                                        Back to Home
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        }
                                    </View>
                                </View>
                            </Modal>

                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={topupModalVisible}
                                onRequestClose={() => {
                                    setTopupModalVisible(!topupModalVisible);
                                }}
                            >
                                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-90 h-full`}>
                                    <View style={[tw`w-11/12 p-5 rounded-xl h-3/6 flex-col items-center justify-between`, { backgroundColor: cardBackgroundColor }]}>
                                        {<View style={tw`flex-row justify-between items-center w-full mb-4`}>
                                            <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>
                                                Topup Card
                                            </Text>
                                            <TouchableOpacity
                                                style={tw`p-2`}
                                                onPress={() => setTopupModalVisible(false)}
                                            >
                                                <Icon name="x" size={28} color={textColor} />
                                            </TouchableOpacity>
                                        </View>}
                                        {!loading && !topupSuccess &&
                                            <View style={tw`w-full h-grow flex-col justify-between`}>
                                                <View style={tw`w-full flex-col items-center justify-center`}>
                                                    <View style={tw`w-full`}>
                                                        <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor }]}>Topup Amount</Text>
                                                        <View style={tw`flex-row w-full justify-between`}>
                                                            <TextInput
                                                                style={[tw`flex-row w-grow mr-1 border-2 bg-transparent`, { borderColor: textColor, color: textColor }]}
                                                                onChangeText={(text: any) => {
                                                                    setTopupAmount(text);
                                                                }}
                                                                placeholder="SYP X,XXX,XXX"
                                                                maxLength={7}
                                                                value={topupAmount}
                                                                keyboardType='numeric'
                                                                placeholderTextColor={textColor}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>
                                                <View>
                                                    <TouchableOpacity
                                                        style={[tw`flex-row justify-center items-center`, { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }]}
                                                        onPress={async () => {
                                                            if (topupAmount.length < 1) {
                                                                Alert.alert('Error', 'Please enter a valid topup amount');
                                                                return;
                                                            }

                                                            setLoading(true);

                                                            try {

                                                                const response = await axios.put(`${baseUrl}/card/balance/${cardNumber}`, {
                                                                    jwt,
                                                                    payload: encryptData({
                                                                        amount: Number.parseFloat(topupAmount),
                                                                        type: "Deposit"
                                                                    }, aesKey)
                                                                });

                                                                const decryptedPayload = decryptData(response.data.payload, aesKey);
                                                                console.log(decryptedPayload);
                                                                if (response.status == 200) {
                                                                    setTopupSuccess(true);
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
                                                            Top Up Card
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        }

                                        {loading &&
                                            <View style={tw`w-full h-grow flex-col justify-center`}>
                                                <ActivityIndicator size="large" color={textColor} />
                                            </View>
                                        }

                                        {!loading && topupSuccess &&
                                            <View style={tw`w-full h-grow flex-col justify-between`}>
                                                <View style={tw`w-full flex-col items-center justify-center mt-8`}>
                                                    <Icon name={"check"} size={100} color={textColor} />
                                                    <Text style={[tw`text-2xl font-bold text-center mt-2`, { color: textColor }]}>
                                                        Card topped up
                                                    </Text>
                                                    <Text style={[tw`text-2xl font-bold text-center`, { color: textColor }]}>
                                                        Successfully
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={[tw`flex-row justify-center items-center`, { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }]}
                                                    onPress={async () => {
                                                        setTopupModalVisible(false);
                                                        navigation.reset({
                                                            index: 0,
                                                            routes: [{ name: 'Home' }],
                                                        });
                                                    }}
                                                >
                                                    <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                                                        Back to Home
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        }
                                    </View>
                                </View>
                            </Modal>

                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={withdrawModalVisible}
                                onRequestClose={() => {
                                    setWithdrawModalVisible(!withdrawModalVisible);
                                }}
                            >
                                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-90 h-full`}>
                                    <View style={[tw`w-11/12 p-5 rounded-xl h-3/6 flex-col items-center justify-between`, { backgroundColor: cardBackgroundColor }]}>
                                        {<View style={tw`flex-row justify-between items-center w-full mb-4`}>
                                            <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>
                                                Withdraw from Card
                                            </Text>
                                            <TouchableOpacity
                                                style={tw`p-2`}
                                                onPress={() => setWithdrawModalVisible(false)}
                                            >
                                                <Icon name="x" size={28} color={textColor} />
                                            </TouchableOpacity>
                                        </View>}
                                        {!loading && !withdrawSuccess &&
                                            <View style={tw`w-full h-grow flex-col justify-between`}>
                                                <View style={tw`w-full flex-col items-center justify-center`}>
                                                    <View style={tw`w-full`}>
                                                        <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor }]}>Withdraw Amount</Text>
                                                        <View style={tw`flex-row w-full justify-between`}>
                                                            <TextInput
                                                                style={[tw`flex-row w-grow mr-1 border-2 bg-transparent`, { borderColor: textColor, color: textColor }]}
                                                                onChangeText={(text: any) => {
                                                                    setWithdrawAmount(text);
                                                                }}
                                                                placeholder="SYP X,XXX,XXX"
                                                                maxLength={7}
                                                                value={withdrawAmount}
                                                                keyboardType='numeric'
                                                                placeholderTextColor={textColor}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>
                                                <View>
                                                    <TouchableOpacity
                                                        style={[tw`flex-row justify-center items-center`, { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }]}
                                                        onPress={async () => {
                                                            if (withdrawAmount.length < 1) {
                                                                Alert.alert('Error', 'Please enter a valid withdraw amount');
                                                                return;
                                                            }

                                                            setLoading(true);

                                                            try {

                                                                const response = await axios.put(`${baseUrl}/card/balance/${cardNumber}`, {
                                                                    jwt,
                                                                    payload: encryptData({
                                                                        amount: Number.parseFloat(withdrawAmount),
                                                                        type: "Withdraw"
                                                                    }, aesKey)
                                                                });

                                                                const decryptedPayload = decryptData(response.data.payload, aesKey);
                                                                console.log(decryptedPayload);
                                                                if (response.status == 200) {
                                                                    setWithdrawSuccess(true);
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
                                                            Withdraw from Card
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        }

                                        {loading &&
                                            <View style={tw`w-full h-grow flex-col justify-center`}>
                                                <ActivityIndicator size="large" color={textColor} />
                                            </View>
                                        }

                                        {!loading && withdrawSuccess &&
                                            <View style={tw`w-full h-grow flex-col justify-between`}>
                                                <View style={tw`w-full flex-col items-center justify-center mt-8`}>
                                                    <Icon name={"check"} size={100} color={textColor} />
                                                    <Text style={[tw`text-2xl font-bold text-center mt-2`, { color: textColor }]}>
                                                        Withdraw Successful
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={[tw`flex-row justify-center items-center`, { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }]}
                                                    onPress={async () => {
                                                        setWithdrawModalVisible(false);
                                                        navigation.reset({
                                                            index: 0,
                                                            routes: [{ name: 'Home' }],
                                                        });
                                                    }}
                                                >
                                                    <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                                                        Back to Home
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        }
                                    </View>
                                </View>
                            </Modal>
                            {/* <Modal
                                animationType="slide"
                                transparent={true}
                                visible={nfcModalVisible}
                                onRequestClose={() => {
                                    setNfcModalVisible(!nfcModalVisible);
                                }}
                            >
                                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-90 h-full`}>
                                    <View style={[tw`w-11/12 p-5 rounded-xl h-3/6 flex-col items-center justify-between`, { backgroundColor: cardBackgroundColor }]}>
                                        <View style={tw`flex-row justify-between items-center w-full mb-4`}>
                                            <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>
                                                Create Digital Card
                                            </Text>
                                            <TouchableOpacity
                                                style={tw`p-2`}
                                                onPress={() => {
                                                    setNfcWriteSuccess(false);
                                                    setNfcModalVisible(false);
                                                }}
                                            >
                                                <Icon name="x" size={28} color={textColor} />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={tw`w-full h-grow flex-col justify-between`}>
                                            <View style={tw`w-full flex-col items-center justify-center`}>
                                                <Icon name={"wifi"} size={100} color={textColor} />
                                                <Text style={[tw`text-2xl font-bold text-center`, { color: textColor }]}>
                                                    Tap your physical card to issue
                                                </Text>
                                            </View>
                                            {loading && (
                                                <ActivityIndicator size="large" color={textColor} style={tw`mt-4`} />
                                            )}
                                            {nfcWriteSuccess && (
                                                <View style={tw`flex-row justify-center items-center mt-4`}>
                                                    <Icon name="check-circle" size={28} color="green" />
                                                    <Text style={[tw`text-lg font-bold ml-2`, { color: 'green' }]}>
                                                        Write Successful
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </Modal> */}
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
                <BottomTab navigation={navigation} />
            </View>
        </TouchableWithoutFeedback>

    );
};

export default CardDetails;
