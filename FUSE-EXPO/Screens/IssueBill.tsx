import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, Modal, ActivityIndicator, Keyboard, Alert } from 'react-native';
import {
    TextInput as DefaultTextInput,
    Platform,
    TextInputProps,
    Image,
} from "react-native";
import BottomTab from '../Components/BottomTab';
import { useTheme } from '../ThemeContext';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../AppNavigator';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import axios from 'axios';
import baseUrl from '../baseUrl';
import { decryptData, encryptData } from '../crypto-utils';
import QRCodeStyled from 'react-native-qrcode-styled';
import NfcManager, { NfcTech, NfcEvents, TagEvent } from 'react-native-nfc-manager';

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

const IssueBill: React.FC = () => {
    const { theme } = useTheme();
    const [logoBase64, setLogoBase64] = useState<string>('');

    const jwt = useSelector((state: RootState) => state.auth.jwt);
    const aesKey = useSelector((state: RootState) => state.auth.aesKey);

    const [amount, setAmount] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [finalDetailsModalVisible, setFinalDetailsModalVisible] = useState<boolean>(false);

    const [nfcSupported, setNfcSupported] = useState<boolean>(false);
    const [nfcEnabled, setNfcEnabled] = useState<boolean>(false);
    const [tagDetails, setTagDetails] = useState<object>({});
    const [nfcTagModalVisible, setNfcTagModalVisible] = useState<boolean>(false);
    const [paidWithCardSuccessfully, setPaidWithCardSuccessfully] = useState<boolean>(false);
    const [paidWithCardFailure, setPaidWithCardFailure] = useState<boolean>(false);

    const [bill, setBill] = useState<object>({});
    const [billNumber, setBillNumber] = useState<number>();

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
    const textColor = theme === 'light' ? '#1F1F1F' : '#FFFFFF';
    const borderColor = theme === 'light' ? '#CCCCCC' : '#444444';
    const placeholderColor = theme === 'light' ? '#999999' : '#A0A0A0';
    const buttonColor = theme === 'light' ? '#028174' : '#65e991';
    const buttonTextColor = theme === 'light' ? '#FFFFFF' : '#181E20';
    const linkColor = theme === 'light' ? '#028174' : '#92DE8B';
    const cardBackgroundColor = theme === 'light' ? '#F0F0F0' : '#424242';

    const ModalButton = ({ title, onPress, iconName }: { title: string, onPress: () => void, iconName: string }) => (
        <TouchableOpacity
            style={[tw`flex-row items-center justify-center py-3 rounded-lg mx-1 px-4`, { backgroundColor: buttonColor }]}
            onPress={onPress}
        >
            <Icon name={iconName} size={28} color={buttonTextColor} />
            <Text style={[tw`text-xl font-bold ml-2`, { color: buttonTextColor }]}>{title}</Text>
        </TouchableOpacity>
    );

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

    useEffect(() => {
        async function initNfc() {
            const supported = await NfcManager.isSupported();
            setNfcSupported(supported);
            if (!supported) return;

            await NfcManager.start();
            const enabled = await NfcManager.isEnabled();
            setNfcEnabled(enabled);

            // setupTagDetection();
        }

        initNfc();

        return () => {
            NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
            NfcManager.unregisterTagEvent().catch(() => 0);
        };
    }, []);

    const setupTagDetection = async () => {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: TagEvent) => {
            const payload = extractPayload(tag);
            setTagDetails(JSON.parse(payload));
            payBillWithCard(JSON.parse(payload));
            setNfcTagModalVisible(true);
            if (Platform.OS === 'ios') {
                NfcManager.setAlertMessageIOS('NFC tag detected!');
            }
            NfcManager.unregisterTagEvent().catch(() => 0);
        });

        await NfcManager.registerTagEvent();
    };

    const extractPayload = (tag: TagEvent): string => {
        if (tag.ndefMessage && tag.ndefMessage.length > 0) {
            const ndefRecord = tag.ndefMessage[0];
            if (ndefRecord.payload && ndefRecord.payload.length > 0) {
                // Assuming the payload is a text record
                const text = ndefRecord.payload.slice(3).map((byte: number) => String.fromCharCode(byte)).join('');
                return text;
            }
        }
        return 'No payload found';
    };

    const handleCheckAgain = async () => {
        setTagDetails({});
        // setNfcTagModalVisible(false);
        await NfcManager.unregisterTagEvent();
        setupTagDetection();
    };

    const payBillWithCard = async (card: object) => {
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
            console.log("Paid By Card");
            console.log(decryptedPayload.payedBill[0]);
            setBill(decryptedPayload.payedBill[0]);

            setLoading(false);
            setPaidWithCardSuccessfully(true);
        } catch (error: any) {
            // console.error('Error fetching data', error);
            setLoading(false);
            setPaidWithCardFailure(true);
            setPaidWithCardSuccessfully(false);
        }
    };

    const AccountDetail = ({ title, content }: { title: string, content: string }) => (
        <View style={tw`pb-4 pl-4`}>
            <Text style={[tw`text-sm`, { color: textColor }]}>{title}</Text>
            <Text style={[tw`font-bold text-2xl tracking-wide`, { color: textColor }]}>{content}</Text>
        </View>
    );

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
                        <h1>Account Details</h1>
                        <p><strong>Sender:</strong> ${"Sender Name"}</p>
                        <p><strong>Account Number:</strong> ${bill?.accountNumber}</p>
                        <p><strong>Currency:</strong> ${bill?.currency}</p>
                        <p><strong>Amount:</strong> ${amount}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        const fileName = `Transaction_${bill?.id.replace(/\s+/g, '_')}.pdf`;
        const newUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.moveAsync({
            from: uri,
            to: newUri,
        });
        await Sharing.shareAsync(newUri);
    };

    const reloadBill = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${baseUrl}/bill/${bill.id}`, { jwt });
            const decryptedPayload = decryptData(response.data.payload, aesKey);
            console.log(decryptedPayload);
            setBill(decryptedPayload);

            setLoading(false);
        } catch (error: any) {
            Alert.alert('Error', error.response.data.message);
            console.error('Error fetching data', error);
            setLoading(false);
        }
    };
    return (
        <View style={[tw`flex-1 justify-between`, { backgroundColor }]}>
            <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />
            <View style={tw`flex-row items-center mt-4 mx-4 py-2`}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-2`}>
                    <Icon name="arrow-left" size={28} color={textColor} />
                </TouchableOpacity>
                <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>Issue Bill</Text>
            </View>
            <View style={tw`px-5 pb-5 flex-col justify-between h-4/5`}>
                <View style={tw`flex-col justify-start`}>
                    <View>
                        <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor }]}>Amount</Text>
                        <View style={tw`flex-row w-full justify-between`}>
                            <TextInput
                                style={[tw`flex-row w-grow mr-1 border-2 bg-transparent`, { borderColor, color: textColor }]}
                                onChangeText={(text) => {
                                    setAmount(text);
                                }}
                                placeholder="$ X,XXX"
                                keyboardType="number-pad"
                                maxLength={16}
                                placeholderTextColor={placeholderColor}
                                value={amount}
                            />
                        </View>
                    </View>
                    <View style={tw`mt-4`}>
                        <Text style={[tw`text-sm pl-2 pb-1`, { color: textColor }]}>Description (Optional)</Text>
                        <View style={tw`flex-row w-full justify-between`}>
                            <TextInput
                                style={[tw`flex-row  w-grow mr-1 border-2 bg-transparent pt-3`, { borderColor, color: textColor, height: 150, textAlignVertical: 'top' }]}
                                onChangeText={(text) => {
                                    setDescription(text);
                                }}
                                placeholder="(Optional) Describe this transaction here..."
                                maxLength={250}
                                placeholderTextColor={placeholderColor}
                                multiline={true}
                                value={description || ""}
                            />
                        </View>
                        <TouchableOpacity
                            style={[tw`flex-row justify-center items-center mt-8`, { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }]}
                            onPress={async () => {
                                try {
                                    console.log(amount);
                                    console.log(description);

                                    const response = await axios.put(`${baseUrl}/bill`, {
                                        jwt,
                                        payload: encryptData({
                                            amount: Number.parseFloat(amount),
                                            details: description
                                        }, aesKey)
                                    });
                                    const decryptedPayload = decryptData(response.data.payload, aesKey);
                                    console.log(decryptedPayload);
                                    setBill(decryptedPayload.bill);
                                    setBillNumber(decryptedPayload.bill.id);
                                    setFinalDetailsModalVisible(true);
                                    // setupTagDetection();
                                } catch (error) {
                                    console.error('Error fetching user data:', error);
                                }
                            }}
                        >
                            <Icon name={"check"} size={20} color={buttonTextColor} />
                            <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                                Issue Bill
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={finalDetailsModalVisible}
                onRequestClose={() => {
                    setFinalDetailsModalVisible(!finalDetailsModalVisible);
                }}
            >
                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-90 h-full`}>
                    {/* <View style={[tw`w-11/12 p-5 rounded-xl h-7/8 flex-col items-center justify-between`, { backgroundColor: cardBackgroundColor }]}> */}
                    <View style={[tw`w-full p-5 h-full flex-col items-center justify-start`, { backgroundColor: cardBackgroundColor }]}>
                        <View style={tw`flex-row justify-between items-center w-full mb-4`}>
                            <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>
                                Bill Issued Successfully
                            </Text>
                            <TouchableOpacity
                                style={tw`p-2`}
                                onPress={() => setFinalDetailsModalVisible(false)}
                            >
                                <Icon name="x" size={28} color={textColor} />
                            </TouchableOpacity>
                        </View>
                        {loading &&
                            <View>
                                <ActivityIndicator size="large" color={textColor} />
                            </View>
                        }
                        {!loading && <View style={tw`w-full h-grow flex-col justify-between`}>
                            {Object.keys(bill).length > 0 &&
                                <View style={tw`w-full`}>
                                    <AccountDetail title='Bill Number' content={bill.id} />
                                    <AccountDetail title='Category' content={bill.category} />
                                    <AccountDetail title='Amount' content={bill.amount} />
                                    <AccountDetail title='Description' content={bill.details} />
                                    <View style={tw`flex-row justify-between items-center w-full pr-4`}>
                                        <AccountDetail title='Status' content={bill.status} />
                                        <TouchableOpacity onPress={() => reloadBill()}>
                                            <Icon name="rotate-ccw" size={25} color={textColor} />
                                        </TouchableOpacity>
                                    </View>
                                    {bill.status !== "Paid" &&
                                        <View style={tw`items-center`}>
                                            <QRCodeStyled
                                                data={bill.id.toString()}
                                                style={[tw`rounded-2xl`, { backgroundColor: 'white' }]}
                                                padding={20}
                                                pieceSize={8}
                                                pieceCornerType='rounded'
                                                pieceBorderRadius={3}
                                                isPiecesGlued={true}
                                            />
                                        </View>}
                                </View>}
                            {bill.status !== "Paid" && <View>
                                <TouchableOpacity
                                    style={[tw`flex-row justify-center items-center mt-8`, { backgroundColor: buttonColor, padding: 16, borderRadius: 8 }]}
                                    onPress={async () => {
                                        setNfcTagModalVisible(true);
                                        setupTagDetection();
                                    }}
                                >
                                    <Icon name={"credit-card"} size={20} color={buttonTextColor} />
                                    <Text style={[tw`text-base font-bold ml-2`, { color: buttonTextColor }]}>
                                        Pay with Card
                                    </Text>
                                </TouchableOpacity>
                            </View>}
                            <View>
                                <TouchableOpacity
                                    style={[tw`flex-row justify-center items-center w-full`, { borderColor, padding: 16, borderRadius: 8 }]}
                                    onPress={async () => {
                                        setFinalDetailsModalVisible(false);
                                        navigation.reset({
                                            index: 0,
                                            routes: [{ name: 'Home' }],
                                        });
                                    }}
                                >
                                    <Text style={[tw`text-base font-bold ml-2`, { color: buttonColor }]}>
                                        Return to Home
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        </View>}
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={nfcTagModalVisible}
                onRequestClose={() => {
                    setNfcTagModalVisible(!nfcTagModalVisible);
                }}
            >
                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                    <View style={[tw`w-10/12 p-5 rounded-xl`, { backgroundColor: cardBackgroundColor, maxHeight: '50%' }]}>
                        <View style={tw`flex-row justify-between items-center w-full`}>
                            <Text style={[tw`text-xl font-bold`, { color: textColor }]}>
                                Pay with Card
                            </Text>
                            <TouchableOpacity
                                style={tw`p-2`}
                                onPress={() => setNfcTagModalVisible(false)}
                            >
                                <Icon name="x" size={24} color={textColor} />
                            </TouchableOpacity>
                        </View>
                        <View>
                            {loading &&
                                <ActivityIndicator size="large" color={textColor} />
                            }
                            {!loading && !paidWithCardFailure && !paidWithCardSuccessfully && <View style={tw`w-full flex-col items-center py-8`}>
                                <Icon name={"wifi"} size={100} color={textColor} />
                                <Text style={[tw`text-xl font-bold`, { color: textColor }]}>Tap the card to pay</Text>
                            </View>}
                            {!loading && paidWithCardSuccessfully && <View style={tw`w-full flex-col items-center`}>
                                <Icon name={"check"} size={100} color={textColor} />
                                <Text style={[tw`text-xl font-bold`, { color: textColor }]}>Bill Paid Successfully</Text>
                                <TouchableOpacity
                                    style={[tw`flex-row justify-center items-center p-4`]}
                                    onPress={() => {
                                        navigation.reset({
                                            index: 0,
                                            routes: [{ name: 'Home' }],
                                        });
                                    }}
                                >
                                    <Text style={[tw`text-sm font-bold`, { color: buttonColor }]}>
                                        Back to Home
                                    </Text>
                                </TouchableOpacity>
                                {/* <ModalButton title="Check Again" onPress={handleCheckAgain} iconName="refresh-cw" /> */}
                            </View>}
                            {!loading && paidWithCardFailure && <View style={tw`w-full flex-col items-center`}>
                                <Icon name={"x"} size={100} color={textColor} />
                                <Text style={[tw`text-xl font-bold`, { color: textColor }]}>Error Paying Bill</Text>
                                <TouchableOpacity
                                    style={[tw`flex-row justify-center items-center border-2 w-full mt-8`, { borderColor, padding: 16, borderRadius: 8 }]}
                                    onPress={() => {
                                        handleCheckAgain();
                                        setLoading(false);
                                        setPaidWithCardFailure(false);
                                        setPaidWithCardSuccessfully(false);
                                    }}
                                >
                                    <Icon name="rotate-ccw" size={15} color={textColor} />
                                    <Text style={[tw`text-sm font-bold ml-1`, { color: textColor }]}>
                                        Try Again
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
                                    <Text style={[tw`text-sm font-bold`, { color: backgroundColor }]}>
                                        Back to Home
                                    </Text>
                                </TouchableOpacity>
                            </View>}
                        </View>
                    </View>
                </View>
            </Modal>
            {/* <BottomTab navigation={navigation} /> */}
        </View >
    );
};

export default IssueBill;
