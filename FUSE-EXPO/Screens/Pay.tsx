import React, { useEffect, useState, useCallback } from 'react';
import { KeyboardAvoidingView, View, Text, StatusBar, TouchableOpacity, Modal, ActivityIndicator, Keyboard, ScrollView, Alert, RefreshControl } from 'react-native';
import {
    TextInput as DefaultTextInput,
    Platform,
    TextInputProps,
    Image,
} from "react-native";
import { useTheme } from '../ThemeContext';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../AppNavigator';
import { Input } from "@rneui/base";
import { RNCamera, BarCodeReadEvent } from 'react-native-camera';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import CreditCard from '../Components/CreditCard';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import { decryptData, encryptData } from '../crypto-utils';
import axios from 'axios';
import baseUrl from '../baseUrl';

import CartGlass1 from '../assets/Cart Glass 1.png';
import CartGlass3 from '../assets/Cart Glass 3.png';
import CartGlass7 from '../assets/Cart Glass 7.png';
import CartGlass8 from '../assets/Cart Glass 8.png';

const TextInput = ({
    placeholderTextColor,
    ...props
}: TextInputProps) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleEndEditing = () => {
        setIsFocused(false);
    };

    return (
        <DefaultTextInput
            {...props}
            onFocus={handleFocus}
            onEndEditing={handleEndEditing}
            style={[
                tw`bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-md h-12 px-4 text-neutral-950 dark:text-neutral-50`,
                isFocused && Platform.OS !== "web" ? tw`border-blue-500` : {},
                props.style,
            ]}
            placeholderTextColor={
                placeholderTextColor || tw.color("text-neutral-500")
            }
        />
    );
};

const Pay: React.FC = () => {
    const { theme } = useTheme();
    const [accountDetailsModalVisible, setAccountDetailsModalVisible] = useState<boolean>(false);
    const [number, onChangeNumber] = React.useState<boolean>();
    const [accNumberErrorMsg, setAccNumberErrorMsg] = useState<string>("Ayyy");
    const [logoBase64, setLogoBase64] = useState<string>('');

    const jwt: string = useSelector((state: any) => state.auth.jwt);
    const aesKey: string = useSelector((state: any) => state.auth.aesKey);

    const [cards, setCards] = useState<object[]>([]);
    const [message, setMessage] = useState<string>("");
    const [billNumber, setBillNumber] = useState<string>("");
    const [bill, setBill] = useState<object>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [billFound, setBillFound] = useState<boolean>(true);
    const [selectedCard, setSelectedCard] = useState<object>({});
    const [paidBill, setPaidBill] = useState<object>();

    const [accountFound, setAccountFound] = useState<boolean>(true);
    const [showBillDetails, setShowBillDetails] = useState<boolean>(false);
    const [billNotFound, setBillNotFound] = useState<boolean>(false);
    const [billConfirmed, setBillConfirmed] = useState<boolean>(false);
    const [showSelectCard, setShowSelectCard] = useState<boolean>(false);
    const [showTransactionStatus, setShowTransactionStatus] = useState<boolean>(false);
    const [transactionStatus, setTransactionStatus] = useState<string>("");
    const [showCta, setShowCta] = useState<boolean>(true);
    const [showSearchbar, setShowSearchbar] = useState<boolean>(true);
    const [showFinalDetails, setShowFinalDetails] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
    const textColor = theme === 'light' ? '#1F1F1F' : '#FFFFFF';
    const borderColor = theme === 'light' ? '#CCCCCC' : '#444444';
    const placeholderColor = theme === 'light' ? '#999999' : '#A0A0A0';
    const buttonColor = theme === 'light' ? '#028174' : '#65e991';
    const buttonTextColor = theme === 'light' ? '#FFFFFF' : '#181E20';
    const linkColor = theme === 'light' ? '#028174' : '#65e991';
    const cardBackgroundColor = theme === 'light' ? '#F0F0F0' : '#424242';
    const lightBackgrounds = [CartGlass1, CartGlass3, CartGlass7, CartGlass8];
    const darkBackgrounds = [CartGlass1, CartGlass3, CartGlass7, CartGlass8];

    useEffect(() => {
        const loadLogo = async () => {
            const logoAsset = Asset.fromModule(require('../assets/FuseLogo.png'));
            await logoAsset.downloadAsync();
            const base64 = await FileSystem.readAsStringAsync(logoAsset.localUri || logoAsset.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            setLogoBase64(`data:image/png;base64,${base64}`);
        };

        loadLogo();
    }, []);

    const fetchCards = async () => {
        try {
            const response = await axios.post(`${baseUrl}/card/user`, { jwt });
            const decryptedPayload = decryptData(response.data.payload, aesKey);
            setCards(decryptedPayload);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchCards();
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
        setRefreshing(false);
    }, []);

    const CustomButton = ({ title, onPress, iconName }: { title: string, onPress: () => void, iconName: string }) => (
        <TouchableOpacity
            style={[tw`flex-row items-center justify-center w-1/2 py-3 my-2 rounded-full mx-1`, { backgroundColor: buttonColor }]}
            onPress={onPress}
        >
            <Icon name={iconName} size={28} color={buttonTextColor} />
            <Text style={[tw`text-xl font-bold ml-2`, { color: buttonTextColor }]}>{title}</Text>
        </TouchableOpacity>
    );

    const AccountDetail = ({ title, content }: { title: string, content: string }) => (
        <View style={tw`pb-4 pl-4`}>
            <Text style={[tw`text-sm`, { color: textColor }]}>{title}</Text>
            <Text style={[tw`font-bold text-2xl tracking-wide`, { color: textColor }]}>{content}</Text>
        </View>
    );

    const MyInputField = ({ title, placeholder }: { title: string, placeholder: string }) => (
        <View style={tw`pb-4`}>
            <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor }]}>{title}</Text>
            <TextInput
                style={[tw`flex-row w-full border-2 bg-transparent`, { borderColor, color: textColor }]}
                onChangeText={(text) => { setBillNumber(text); }}
                placeholder={placeholder}
                keyboardType="number-pad"
                maxLength={30}
                value={billNumber}
                placeholderTextColor={placeholderColor}
            />
        </View>
    );

    const searchForBill = async (billNumber: string) => {
        setLoading(true);
        try {
            const response = await axios.post(`${baseUrl}/bill/${billNumber}`, { jwt });
            const decryptedPayload = decryptData(response.data.payload, aesKey);
            console.log('Decrypted Bill Data:', decryptedPayload); // Log the decrypted bill data
            setBill(decryptedPayload);

            setShowBillDetails(true);
            setShowCta(false);
            setShowSearchbar(false);
            setLoading(false);
        } catch (error: any) {
            Alert.alert('Error', error.response.data.message);
            console.error('Error fetching data', error);
            setLoading(false);
        }
    };

    const initializeFields = () => {
        setAccountFound(false);
        setBillNotFound(false);
        setBillNumber("");
        setMessage("");
        setAccountDetailsModalVisible(false);
        setLoading(false);
        setShowBillDetails(false);
        setShowFinalDetails(false);
        setShowCta(true);
        setShowSearchbar(true);
        setShowSelectCard(false);
        setShowTransactionStatus(false);
    };

    const handleBarCodeRead = (e: BarCodeReadEvent) => {
        searchForBill(e.data);
        setAccountDetailsModalVisible(false);
    };

    const confirmBill = () => {
        setBillConfirmed(true);
        setShowBillDetails(false);
        setShowCta(false);
        setShowSearchbar(false);
        setShowSelectCard(true);
        setShowFinalDetails(false);
    };

    const selectCard = (card: object) => {
        console.log(card);
        setSelectedCard(card);
        setShowSelectCard(false);
        setShowFinalDetails(true);
    };

    const payBill = async (bill: object, card: object) => {
        setLoading(true);
        try {
            const response = await axios.post(`${baseUrl}/bill/pay/${bill.id}`, {
                jwt,
                payload: encryptData({
                    cardId: card.id,
                    cvv: card.cvv,
                    month: (new Date(card.expiryDate).getMonth() + 1).toString(),
                    year: (new Date(card.expiryDate).getFullYear()).toString(),
                }, aesKey),
            });
            const decryptedPayload = decryptData(response.data.payload, aesKey);
            console.log(decryptedPayload);
            setBill(decryptedPayload);

            setShowTransactionStatus(true);
            setShowBillDetails(false);
            setShowCta(false);
            setShowSearchbar(false);
            setShowFinalDetails(false);
            setTransactionStatus("success");
            setLoading(false);
        } catch (error: any) {
            Alert.alert('Error', error.response.data.message);
            console.error('Error fetching data', error);
            setLoading(false);
        }
    };

    const cancelTransaction = () => {
        initializeFields();
    };

    const generatePDF = async () => {
        if (!logoBase64) {
            console.error('Logo base64 data is not loaded yet');
            Alert.alert('Error', 'Logo is still loading. Please try again in a moment.');
            return;
        }

        const payedBill = bill.payedBill[0];
        const cardDetails = bill.payedBill[1];

        const htmlContent = `
            <html>
            <body>
                <div style="padding: 20px; position: relative;">
                    <img src="${logoBase64}" style="position: absolute; top: 80px; left: 20px; width: 100px; height: auto;" />
                    <div style="margin-top: 65px;">
                        <center><h1>Transaction Details</h1></center>
                        <center><h2>PAYMENT</h2></center>
                        <br>
                        <p><strong>Payed At:</strong> ${payedBill.payedAt}</p>
                        <p><strong>Status:</strong> ${payedBill.status}</p>
                        <p><strong>Category:</strong> ${payedBill.category}</p>
                        <p><strong>Amount: $</strong> ${payedBill.amount}</p>
                        <p><strong>Card ID:</strong> ${cardDetails.id}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            const fileName = `Transaction_${payedBill.id}.pdf`;
            const newUri = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.moveAsync({
                from: uri,
                to: newUri,
            });
            await Sharing.shareAsync(newUri);
        } catch (error) {
            console.error('Error generating or sharing PDF:', error);
            Alert.alert('Error', 'An error occurred while generating or sharing the PDF. Please try again.');
        }
    };



    return (
        <View style={[tw`flex-1 justify-between`, { backgroundColor }]}>
            <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />
            <View style={tw`flex-row items-center mt-4 mx-4 py-2`}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-2`}>
                    <Icon name="arrow-left" size={28} color={textColor} />
                </TouchableOpacity>
                <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>Pay</Text>
            </View>
            <View style={tw`px-5 pb-5 flex-col justify-between h-4/5`}>
                {/* Content excluding QR Code CTA */}
                <View style={tw`flex-col justify-start`}>
                    {/* Search Section*/}
                    {showSearchbar && <View style={tw``}>
                        {/* Bill Number Input Field */}
                        <View style={tw``}>
                            <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor }]}>Bill Number</Text>
                            <View style={tw`flex-row w-full justify-between`}>
                                <TextInput
                                    style={[tw`flex-row w-grow mr-1 border-2 bg-transparent`, { borderColor, color: textColor }]}
                                    onChangeText={(text) => {
                                        setBillNumber(text);
                                    }}
                                    placeholder="XXXX XXXX XXXX XXXX"
                                    keyboardType="number-pad"
                                    maxLength={20}
                                    placeholderTextColor={placeholderColor}
                                    onTouchStart={() => initializeFields()}
                                />
                                <TouchableOpacity
                                    style={[
                                        tw`flex-row items-center justify-center py-3 rounded-lg px-4 border-2`,
                                        { borderColor },
                                    ]}
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        searchForBill(billNumber);
                                    }}
                                >
                                    <Icon
                                        name={"search"}
                                        size={20}
                                        color={textColor}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    }

                    {/* Middle Content */}
                    <View style={tw`mt-4`}>
                        {/* Loading */}
                        {loading &&
                            <View style={tw`flex-row justify-center items-center w-full mt-24`}>
                                <ActivityIndicator size="large" color={textColor} />
                            </View>
                        }

                        {/* Bill Not Found */}
                        {billNotFound && <View style={tw`flex-col items-center w-full mt-16`}>
                            <Icon name={"file-minus"} size={120} color={textColor} />
                            <Text style={[tw`text-2xl font-bold mb-4`, { color: textColor }]}>
                                Bill Not Found
                            </Text>
                            <Text style={[tw`text-sm font-bold text-center w-2/3`, { color: textColor }]}>
                                Please make sure you have entered the correct bill number and try again.
                            </Text>
                        </View>}

                        {/* Bill details */}
                        {billFound && showBillDetails && <View>
                            <Text style={[tw`text-2xl font-bold mb-2`, { color: textColor }]}>Bill Details</Text>
                            <View style={tw`w-full flex-row justify-center pb-4`}>
                                <View style={[tw`w-full border h-0`, { borderColor }]} />
                            </View>
                            <AccountDetail title='Bill Number' content={bill.id} />
                            <AccountDetail title='Category' content={bill.category} />
                            <AccountDetail title='Merchant' content={bill.merchantAccount.user.name} />
                            <AccountDetail title='Description' content={bill.details} />
                            <AccountDetail title='Amount' content={bill.amount} />
                            <TouchableOpacity
                                style={[tw`flex-row justify-center items-center`, { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }]}
                                onPress={() => confirmBill()}
                            >
                                <Icon name={"check"} size={20} color={buttonTextColor} />
                                <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                                    Confirm
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[tw`flex-row justify-center items-center p-4`]}
                                onPress={() => cancelTransaction()}
                            >
                                <Text style={[tw`text-sm font-bold`, { color: textColor }]}>
                                    Pay a different bill instead
                                </Text>
                            </TouchableOpacity>
                        </View>}

                        {/* Bill details */}
                        {showSelectCard && <View style={tw`h-full`}>
                            <View style={tw`px-4`}>
                                <Text style={[tw`text-2xl font-bold mb-2`, { color: textColor }]}>Select Card</Text>
                                <View style={tw`w-full flex-row justify-center pb-4`}>
                                    <View style={[tw`w-full border h-0`, { borderColor }]} />
                                </View>
                                <AccountDetail title='Amount to pay' content={bill.amount} />
                            </View>
                            <ScrollView
                                style={tw`w-full h-8/12`}
                                contentContainerStyle={tw`w-full flex-col items-center`}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={[theme === 'light' ? 'black' : 'white']}
                                        tintColor={theme === 'light' ? 'black' : 'white'}
                                    />
                                }
                            >
                                {cards.map((card, index) => {
                                    const backgroundImage = theme === 'light'
                                        ? lightBackgrounds[Math.floor(Math.random() * lightBackgrounds.length)] : darkBackgrounds[Math.floor(Math.random() * darkBackgrounds.length)];

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
                                                console.log(card.id);
                                                selectCard(card)
                                            }}
                                            style={tw`w-full mb-4`} // Adjust the width and margin of the card container
                                        >
                                            <CreditCard
                                                backgroundImage={backgroundImage}
                                                id={card.id}
                                                name={card.cardName}
                                                balance={card.balance}
                                                cvv={card.cvv}
                                                expiry={card.expiryDate}
                                            />
                                        </TouchableOpacity>
                                    )
                                })}
                            </ScrollView>
                            <TouchableOpacity
                                style={[tw`flex-row justify-center items-center p-4`]}
                                onPress={() => cancelTransaction()}
                            >
                                <Text style={[tw`text-sm font-bold`, { color: textColor }]}>
                                    Pay a different bill instead
                                </Text>
                            </TouchableOpacity>
                        </View>}

                        {/* Final Bill Details */}
                        {showFinalDetails && <View style={tw`justify-center w-full`}>
                            <Text style={[tw`text-2xl font-bold mb-2`, { color: textColor }]}>Transaction Details</Text>
                            <View style={tw`w-full flex-row justify-center pb-4`}>
                                <View style={[tw`w-full border h-0`, { borderColor }]} />
                            </View>
                            <AccountDetail title='Bill Number' content={bill.id} />
                            <AccountDetail title='Category' content={bill.category} />
                            <AccountDetail title='Description' content={bill.details} />
                            <AccountDetail title='Amount' content={bill.amount} />
                            <AccountDetail title='Card' content={selectedCard.id} />
                            <View style={tw`w-full flex-row justify-center pb-4`}>
                                <View style={[tw`w-full border h-0`, { borderColor }]} />
                            </View>
                            <TouchableOpacity
                                style={[tw`flex-row justify-center items-center`, { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }]}
                                onPress={() => payBill(bill, selectedCard)}
                            >
                                <Icon name={"credit-card"} size={20} color={buttonTextColor} />
                                <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                                    Pay
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[tw`flex-row justify-center items-center p-4`]}
                                onPress={() => cancelTransaction()}
                            >
                                <Text style={[tw`text-sm font-bold`, { color: textColor }]}>
                                    Pay a different bill instead
                                </Text>
                            </TouchableOpacity>
                        </View>}

                        {/* Transaction Status */}
                        {showTransactionStatus && <View style={tw`flex-col items-center w-full h-full justify-center`}>
                            {transactionStatus == "success" &&
                                <View style={tw`flex-col items-center`}>
                                    <Icon name={"check"} size={120} color={buttonColor} />
                                    <Text style={[tw`text-2xl font-bold mb-4`, { color: textColor }]}>
                                        Success
                                    </Text>
                                    <Text style={[tw`text-base font-bold mb-4`, { color: textColor }]}>
                                        Payment completed successfully.
                                    </Text>
                                    <TouchableOpacity
                                        style={[tw`flex-row justify-center items-center border-2 mt-4`, { borderColor, padding: 16, borderRadius: 8 }]}
                                        onPress={() => generatePDF()}
                                    >
                                        <Icon name={"share"} size={20} color={textColor} />
                                        <Text style={[tw`text-base font-bold ml-2`, { color: textColor }]}>
                                            Share Payment
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[tw`flex-row justify-center items-center p-4`]}
                                        onPress={() => {
                                            navigation.reset({
                                                index: 0,
                                                routes: [{ name: 'Home' }],
                                            });
                                        }}
                                    >
                                        <Text style={[tw`text-sm font-bold`, { color: textColor }]}>
                                            Back to Home
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            {transactionStatus != "success" &&
                                <View style={tw`flex-col items-center pt-16`}>
                                    <Icon name={"x"} size={120} color={textColor} />
                                    <Text style={[tw`text-2xl font-bold mb-4`, { color: textColor }]}>
                                        Failure
                                    </Text>
                                    <Text style={[tw`text-base font-bold mb-4`, { color: textColor }]}>
                                        An error occurred, please try again later.
                                    </Text>
                                </View>
                            }
                        </View>}
                        {/* Scan QR CTA Button */}
                        {showCta && (
                            <View style={tw`mt-105 mb-4 px-2.5`}>
                                <Text style={[tw`text-sm mb-1 pl-2`, { color: textColor }]}>
                                    or you can use QR Code instead
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        tw`flex-row justify-center items-center`,
                                        { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }
                                    ]}
                                    onPress={() => setAccountDetailsModalVisible(true)}
                                >
                                    <Icon name={"camera"} size={20} color={buttonTextColor} />
                                    <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                                        Scan QR Code
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={accountDetailsModalVisible}
                onRequestClose={() => {
                    setAccountDetailsModalVisible(!accountDetailsModalVisible);
                }}
            >
                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-75 h-full`}>
                    <View style={[tw`w-11/12 p-5 rounded-xl h-4/6 flex-col items-center justify-start`, { backgroundColor: cardBackgroundColor }]}>
                        <View style={tw`flex-row justify-between items-center w-full mb-4`}>
                            <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>
                                Scan Bill QR Code
                            </Text>
                            <TouchableOpacity
                                style={tw`p-2`}
                                onPress={() => setAccountDetailsModalVisible(false)}
                            >
                                <Icon name="x" size={28} color={textColor} />
                            </TouchableOpacity>
                        </View>
                        {/* Camera */}
                        <View style={tw`h-4/5 w-full`}>
                            <FillToAspectRatio>
                                <RNCamera
                                    style={tw`h-full w-full`}
                                    onBarCodeRead={handleBarCodeRead}
                                    captureAudio={false}
                                />
                            </FillToAspectRatio>
                        </View>
                        <Text style={[tw`text-sm pt-2`, { color: textColor }]}>
                            Point your camera to a bill QR Code to quickly perform your transaction.
                        </Text>
                    </View>
                </View>
            </Modal>
        </View >
    );
};

type LayoutInfo = {
    width: number,
    height: number,
};

type State = {
    layoutInfo: LayoutInfo | null | undefined,
};

type Props = {
    ratio: string,
    children: React.ReactNode,
};

class FillToAspectRatio extends React.Component<Props, State> {
    static defaultProps = {
        ratio: '4:3',
    };
    state = {
        layoutInfo: null,
    };
    handleLayout = ({ nativeEvent: { layout: { width, height } } }: { nativeEvent: { layout: LayoutInfo } }) => {
        this.setState({
            layoutInfo: { width, height },
        });
    };

    getRatio = () => {
        const { ratio } = this.props;
        const [ratioWidth, ratioHeight] = ratio.split(':').map(x => Number(x));
        return ratioHeight / ratioWidth;
    };

    render() {
        const { layoutInfo } = this.state;

        if (!layoutInfo) {
            return <View key="pre-info" onLayout={this.handleLayout} style={{
                flex: 1, overflow: 'hidden', position: 'relative'
            }} />;
        }

        const { height, width } = layoutInfo;
        let wrapperWidth;
        let wrapperHeight;
        const ratio = this.getRatio();
        if (ratio * height < width) {
            wrapperHeight = width / ratio;
            wrapperWidth = width;
        } else {
            wrapperWidth = ratio * height;
            wrapperHeight = height;
        }
        const wrapperPaddingX = (width - wrapperWidth) / 2;
        const wrapperPaddingY = (height - wrapperHeight) / 2;

        return (
            <View onLayout={this.handleLayout} style={{
                flex: 1, overflow: 'hidden', position: 'relative'
            }}>
                <View
                    style={{
                        width: wrapperWidth,
                        height: wrapperHeight,
                        marginLeft: wrapperPaddingX,
                        marginTop: wrapperPaddingY,
                    }}
                >
                    {this.props.children}
                </View>
            </View >
        );
    }
}

export default Pay;
