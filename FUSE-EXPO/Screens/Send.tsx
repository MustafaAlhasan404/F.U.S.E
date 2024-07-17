import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, Modal, ActivityIndicator, Keyboard, Alert } from 'react-native';
import {
    Platform,
    TextInputProps,
    Image,
} from "react-native";
import TextInput from "../Components/TextInput";
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
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import { decryptData, encryptData } from '../crypto-utils';
import axios from 'axios';
import baseUrl from '../baseUrl';

const Send: React.FC = () => {
    const { theme } = useTheme();
    const [accountDetailsModalVisible, setAccountDetailsModalVisible] = useState<boolean>(false);
    const [number, onChangeNumber] = React.useState<boolean>();
    const [accNumberErrorMsg, setAccNumberErrorMsg] = useState<string>("Ayyy");
    const [logoBase64, setLogoBase64] = useState<string>('');

    const jwt: string = useSelector((state: any) => state.auth.jwt);
    const aesKey: string = useSelector((state: any) => state.auth.aesKey);
    const user = useSelector((state: any) => state.auth.user);

    const [message, setMessage] = useState<string>("");
    const [recipient, setRecipient] = useState<object>({});

    const searchForAccount = async (accountNumber: string) => {
        setLoading(true);
        try {
            const response = await axios.post(`${baseUrl}/account/user/${accountNumber}`, { jwt });
            const decryptedPayload = decryptData(response.data.payload, aesKey);
            console.log(decryptedPayload);
            setRecipient(decryptedPayload);

            setShowAccountDetails(true);
            setAccountFound(true);
            setShowCta(false);
            setShowSearchbar(false);
            setLoading(false);
        } catch (error: any) {
            setAccountNotFound(true);
            setAccountFound(false);
            // Alert.alert('Error', error.response.data.message);
            console.error('Error fetching data', error);
            setLoading(false);
        }
    };

    const [accountNumber, setAccountNumber] = useState<string>("");
    const [accountFound, setAccountFound] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [showAccountDetails, setShowAccountDetails] = useState<boolean>(false);
    const [accountNotFound, setAccountNotFound] = useState<boolean>(false);
    const [showFavourites, setShowFavourites] = useState<boolean>(false);
    const [accountConfirmed, setAccountConfirmed] = useState<boolean>(false);
    const [showAmountInput, setShowAmountInput] = useState<boolean>(false)
    const [amount, setAmount] = useState<string>("$0,000");
    const [showFinalDetails, setShowFinalDetails] = useState<boolean>(false);
    const [showTransactionStatus, setShowTransactionStatus] = useState<boolean>(false);
    const [transactionStatus, setTransactionStatus] = useState<string>("");
    const [transaction, setTransaction] = useState<object>({});

    const [showCta, setShowCta] = useState<boolean>(true);
    const [showSearchbar, setShowSearchbar] = useState<boolean>(true);

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
    const textColor = theme === 'light' ? '#1F1F1F' : '#FFFFFF';
    const borderColor = theme === 'light' ? '#CCCCCC' : '#444444';
    const placeholderColor = theme === 'light' ? '#999999' : '#A0A0A0';
    const buttonColor = theme === 'light' ? '#028174' : '#65e991';
    const buttonTextColor = theme === 'light' ? '#FFFFFF' : '#181E20';
    const linkColor = theme === 'light' ? '#028174' : '#92DE8B';
    const cardBackgroundColor = theme === 'light' ? '#F0F0F0' : '#424242';

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
                style={tw`flex-row`}
                onChangeText={(text) => { setAccountNumber(text); }}
                placeholder={placeholder}
                keyboardType="number-pad"
                maxLength={30}
                placeholderTextColor={placeholderColor}
            />
        </View>
    );

    const initializeFields = () => {
        setAccountFound(false);
        setAccountNotFound(false);
        setAccountNumber("");
        setMessage("");
        setAccountDetailsModalVisible(false);
        setShowFavourites(false);
        setLoading(false);
        setShowAccountDetails(false);
        setShowAmountInput(false);
        setShowFinalDetails(false);
        setShowCta(true);
    };

    const handleBarCodeRead = (e: BarCodeReadEvent) => {
        setAccountNumber(e.data);
        searchForAccount(e.data);
        setMessage(e.data);
        setAccountDetailsModalVisible(false);
    };

    const confirmAccount = () => {
        setAccountConfirmed(true);
        setShowAccountDetails(false);
        setShowAmountInput(true);
        setShowCta(false);
        setShowSearchbar(false);
    };

    const inputAmount = () => {
        setShowAmountInput(false);
        setShowFinalDetails(true);
        setShowCta(false);
        setShowSearchbar(false);
    };

    const confirmTransaction = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${baseUrl}/transaction/transfer`, {
                jwt,
                payload: encryptData({
                    type: "Transfer",
                    destinationAccount: recipient.id,
                    sourceAccount: user.checkingNumber,
                    amount: Number.parseInt(amount),
                }, aesKey)
            });
            const decryptedPayload = decryptData(response.data.payload, aesKey);
            console.log(decryptedPayload);
            setTransaction(decryptedPayload.transactions);

            setLoading(false);
            setShowFinalDetails(false);
            setShowTransactionStatus(true);
            setShowCta(false);
            setShowSearchbar(false);
            setTransactionStatus("success");
        } catch (error: any) {
            Alert.alert('Error', error.response.data.message);
            console.error('Error fetching data', error);
            setLoading(false);
        }
    };

    const generatePDF = async () => {
        if (!logoBase64) {
            console.error('Logo base64 data is not loaded yet');
            return;
        }

        const htmlContent = `
            <html>
            <body>
                <div style="padding: 20px; position: relative;">
                    <img src="${logoBase64}" style="position: absolute; top: 20px; left: 20px; width: 100px; height: auto;" />
                    <div style="margin-top: 140px;">
                        <center><h1>Transaction Details</h1></center>
                        <center><h2>TRANSFER</h2></center>
                        <br>
                        <p><strong>Date:</strong> ${transaction[2].createdAt}</p>
                        <p><strong>Transaction Number:</strong> ${transaction[2].id}</p>
                        <p><strong>Amount:</strong> ${transaction[2].amount}</p>
                        <br>
                        <p><strong>Sender Name:</strong> ${user.name}</p>
                        <p><strong>Sender Account Number:</strong> ${user.checkingNumber}</p>
                        <p><strong>Sender Account Type:</strong> ${"Checking"}</p>
                        <br>
                        <p><strong>Recipient Name:</strong> ${recipient.user.name}</p>
                        <p><strong>Recipient Account Number:</strong> ${recipient.id}</p>
                        <p><strong>Account Type:</strong> ${recipient?.type}</p>
                        <br>
                    </div>
                </div>
            </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        const fileName = `Transaction_${transaction[2].id}.pdf`;
        const newUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.moveAsync({
            from: uri,
            to: newUri,
        });
        await Sharing.shareAsync(newUri);
    };
    return (
        <View style={[tw`flex-1 justify-between`, { backgroundColor }]}>
            <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />
            <View style={tw`flex-row items-center mt-4 mx-4 py-2`}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-2`}>
                    <Icon name="arrow-left" size={28} color={textColor} />
                </TouchableOpacity>
                <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>Send</Text>
            </View>
            <View style={tw`px-5 pb-5 flex-col justify-between h-4/5`}>
                {/* Content excluding QR Code CTA */}
                <View style={tw`flex-col justify-start`}>
                    {/* Search Section & Favourites */}
                    {showSearchbar && <View>
                        {/* Account Input Field */}
                        <View>
                            <View>
                                <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor }]}>Account Number / Username</Text>
                                <View style={tw`flex-row w-full justify-between`}>
                                    <TextInput
                                        style={[tw`flex-row w-grow mr-1 border-2 bg-transparent`, { borderColor, color: textColor }]}
                                        onChangeText={(text) => {
                                            setAccountNumber(text);
                                        }}
                                        placeholder="XXXX XXXX XXXX XXXX"
                                        keyboardType="number-pad"
                                        maxLength={20}
                                        placeholderTextColor={placeholderColor}
                                        onTouchStart={() => initializeFields()}
                                        value={accountNumber}
                                    />
                                    <TouchableOpacity
                                        style={[
                                            tw`flex-row items-center justify-center py-3 rounded-lg px-4 border-2`,
                                            { borderColor },
                                        ]}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            searchForAccount(accountNumber);
                                        }}
                                    >
                                        <Icon
                                            name={"search"}
                                            size={20}
                                            color={textColor}
                                        />
                                        {/* <Text style={[tw`text-base font-bold ml-2`, { color: theme === 'light' ? '#FFFFFF' : '#000000' }]}>Share</Text> */}
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </View>
                        {/* Favourites */}
                        <View style={tw`pt-2`}>
                            <TouchableOpacity onPress={() => { setShowFavourites(!showFavourites); Keyboard.dismiss(); }} style={tw`flex-row items-center justify-between pb-2`}>
                                <View style={tw`flex-row items-center`}>
                                    {!showFavourites && <Text style={[tw`text-base`, { color: textColor }]}>Show </Text>}
                                    {showFavourites && <Text style={[tw`text-base`, { color: textColor }]}>Hide </Text>}
                                    <Text style={[tw`text-base`, { color: textColor }]}>Favourites</Text>
                                </View>
                                {!showFavourites && <Icon name={"plus"} size={20} color={textColor} />}
                                {showFavourites && <Icon name={"minus"} size={20} color={textColor} />}
                            </TouchableOpacity>
                            {showFavourites && <View style={tw`flex-row items-center justify-between w-full`}>
                                {['Nour', 'Mustafa', 'Dana', 'Abdullah'].map((card, index) => (
                                    <TouchableOpacity key={index} style={tw`items-center justify-start w-20 pt-2 pb-4 rounded-lg`} onPress={() => { setShowFavourites(false) }}>
                                        <Image
                                            source={{ uri: 'https://www.noracooks.com/wp-content/uploads/2020/05/square.jpg' }}
                                            style={tw`w-16 h-16 rounded-full mb-2`}
                                        />
                                        <Text style={[tw`text-sm`, { color: textColor }]}>{card}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>}
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

                        {/* Account details */}
                        {accountFound && showAccountDetails && <View>
                            <AccountDetail title='Account Number' content={recipient.id} />
                            <AccountDetail title='Account Holder Name' content={recipient.user.name} />
                            <AccountDetail title='Type' content={recipient.type} />
                            <AccountDetail title='Account Status' content={recipient.status} />
                            <TouchableOpacity
                                style={[tw`flex-row justify-center items-center`, { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }]}
                                onPress={() => confirmAccount()}
                            >
                                <Icon name={"check"} size={20} color={buttonTextColor} />
                                <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                                    Confirm
                                </Text>
                            </TouchableOpacity>
                        </View>}

                        {/* Account Not Found */}
                        {accountNotFound && <View style={tw`flex-col items-center w-full`}>
                            <Icon name={"user-x"} size={120} color={textColor} />
                            <Text style={[tw`text-2xl font-bold mb-4`, { color: textColor }]}>
                                Account Not Found
                            </Text>
                            <Text style={[tw`text-sm font-bold text-center w-2/3`, { color: textColor }]}>
                                Please make sure you have entered the correct account number and try again.
                            </Text>
                        </View>}

                        {/* Input Amount */}
                        {showAmountInput &&
                            <View>
                                <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor }]}>Amount</Text>
                                <View style={tw`flex-row w-full justify-between items-center`}>
                                    <TextInput
                                        style={[tw`flex-row w-grow mr-1 border-2 bg-transparent`, { borderColor, color: textColor }]}
                                        onChangeText={(text) => setAmount(text)}
                                        placeholder="X,XXX.xx"
                                        keyboardType="number-pad"
                                        placeholderTextColor={placeholderColor}
                                    />
                                    <TouchableOpacity style={[
                                        tw`flex-row items-center justify-center py-3 rounded-lg px-4 border-2`,
                                        { borderColor },
                                    ]}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            inputAmount();
                                        }}
                                    >
                                        <Icon
                                            name={"check"}
                                            size={20}
                                            color={textColor}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }

                        {/* Final Transaction Details */}
                        {!loading && showFinalDetails && <View style={tw`h-full justify-center w-full`}>
                            <Text style={[tw`text-2xl font-bold mb-2`, { color: textColor }]}>Transaction Details</Text>
                            <View style={tw`w-full flex-row justify-center pb-4`}>
                                <View style={[tw`w-full border h-0`, { borderColor }]} />
                            </View>
                            <AccountDetail title='Account Number' content={recipient.id} />
                            <AccountDetail title='Account Holder Name' content={recipient.user.name} />
                            <AccountDetail title='Type' content={recipient.type} />
                            <AccountDetail title='Account Status' content={recipient.status} />
                            <AccountDetail title='Amount' content={amount} />
                            <View style={tw`w-full flex-row justify-center pb-4`}>
                                <View style={[tw`w-full border h-0`, { borderColor }]} />
                            </View>
                            <TouchableOpacity
                                style={[tw`flex-row justify-center items-center`, { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }]}
                                onPress={() => confirmTransaction()}
                            >
                                <Icon name={"check"} size={20} color={buttonTextColor} />
                                <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                                    Transfer
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[tw`flex-row justify-center items-center p-4`]}
                                onPress={() => confirmTransaction()}
                            >
                                <Text style={[tw`text-sm font-bold`, { color: textColor }]}>
                                    Perform a different transaction instead
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
                                        Transaction completed successfully.
                                    </Text>
                                    <TouchableOpacity
                                        style={[tw`flex-row justify-center items-center border-2 mt-4`, { borderColor, padding: 16, borderRadius: 8 }]}
                                        onPress={() => generatePDF()}
                                    >
                                        <Icon name={"share"} size={20} color={textColor} />
                                        <Text style={[tw`text-base font-bold ml-2`, { color: textColor }]}>
                                            Share Transaction
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
                    </View>
                </View>
                {/* Scan QR CTA Button */}
                {showCta && (
                    <View style={tw`mt-4 mb-4 px-2.5`}>
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
                                Scan Account QR Code
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
                            Point your camera to an account QR Code to quickly perform your transaction.
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

export default Send;
