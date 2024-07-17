import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, TouchableOpacity, Modal, Platform,SafeAreaView } from 'react-native';
import QRCodeStyled from 'react-native-qrcode-styled';
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
import { decryptData, encryptData } from '../crypto-utils';
import axios from 'axios';
import baseUrl from '../baseUrl';

const Receive: React.FC<{ route: any }> = ({ route }) => {
    const { id } = route.params;

    const { theme } = useTheme();
    const [accountDetailsModalVisible, setAccountDetailsModalVisible] = useState<boolean>(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [logoBase64, setLogoBase64] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [account, setAccount] = useState<object>({});

    const user = useSelector((state: any) => state.auth.user);
    const role = useSelector((state: any) => state.auth.role);

    const jwt: string = useSelector((state: any) => state.auth.jwt);
    const aesKey: string = useSelector((state: any) => state.auth.aesKey);

    const primaryColor = theme === 'light' ? '#006e63' : '#65e991';

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
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.post(`${baseUrl}/account/user/${id}`, { jwt });
                const decryptedPayload = decryptData(response.data.payload, aesKey);
                setAccount(decryptedPayload);

                setLoading(false);
            } catch (error: any) {
                // alert('Error', error.response.data.message);
                console.error('Error fetching data', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
    const textColor = theme === 'light' ? '#333333' : '#DDDDDD';
    const cardBackgroundColor = theme === 'light' ? '#F0F0F0' : '#424242';
    const buttonBackgroundColor = theme === 'light' ? '#94B9C5' : '#94B9C5';
    const buttonTextColor = theme === 'light' ? 'text-white' : 'text-black';

    const CustomButton = ({ title, onPress, iconName }: { title: string, onPress: () => void, iconName: string }) => (
        <TouchableOpacity
            style={[tw`flex-row items-center justify-center w-1/2 py-3 my-2 rounded-full mx-1`, { backgroundColor: buttonBackgroundColor }]}
            onPress={onPress}
        >
            <Icon name={iconName} size={28} color={theme === 'light' ? '#FFFFFF' : '#000000'} />
            <Text style={[tw`text-xl font-bold ml-2`, { color: theme === 'light' ? '#FFFFFF' : '#000000' }]}>{title}</Text>
        </TouchableOpacity>
    );

    const ModalButton = ({ title, onPress, iconName }: { title: string, onPress: () => void, iconName: string }) => (
        <TouchableOpacity
            style={[tw`flex-row items-center justify-center py-3 rounded-lg mx-1 px-4`, { backgroundColor: primaryColor }]}
            onPress={onPress}
        >
            <Icon name={iconName} size={28} color={theme === 'light' ? '#FFFFFF' : '#000000'} />
            <Text style={[tw`text-xl font-bold ml-2`, { color: theme === 'light' ? '#FFFFFF' : '#000000' }]}>{title}</Text>
        </TouchableOpacity>
    );

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
                        <p><strong>Account Holder:</strong> ${user.name}</p>
                        <p><strong>Account Number:</strong> ${account.id}</p>
                        <p><strong>Type:</strong> ${account.type}</p>
                        <p><strong>Status:</strong> ${account.status}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    
        try {
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            const fileName = `AccountDetails_${user.name.replace(/\s+/g, '_')}.pdf`;
            const newUri = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.moveAsync({
                from: uri,
                to: newUri,
            });
            await Sharing.shareAsync(newUri);
        } catch (error) {
            console.error('Error generating or sharing PDF:', error);
            // You might want to show an error message to the user here
        }
    };
    

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <View style={[tw`flex-1`, { backgroundColor }]}>
            <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />
            <View style={tw`flex-1 p-2`}>
                <View style={tw`flex-row items-center mt-4 mx-4 py-2`}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-2`}>
                        <Icon name="arrow-left" size={28} color={theme === 'light' ? '#000000' : '#FFFFFF'} />
                    </TouchableOpacity>
                    <Text style={[tw`text-2xl font-bold`, { color: theme === 'light' ? '#000000' : '#FFFFFF' }]}>Account Details</Text>
                </View>
                <View style={tw`p-5`}>
                    <View style={tw`mt-2 items-center`}>
                        {account.id && <View style={tw`bg-white rounded-full`}>
                            <QRCodeStyled
                                data={account.id.toString()}
                                style={[tw`rounded-2xl`, { backgroundColor: 'white' }]}
                                padding={20}
                                pieceSize={8}
                                pieceCornerType='rounded'
                                pieceBorderRadius={3}
                                isPiecesGlued={true}
                            />
                        </View>}
                    </View>
                    <Text style={[tw`text-base mt-10`, { color: textColor }]}>
                        This is your personal QR Code, you can use it to receive transfers from others by simply showing it to the sender's scanner.
                    </Text>
                    <Text style={[tw`text-base mt-10 mb-2`, { color: textColor }]}>
                        or you can share your account details instead
                    </Text>
                    <TouchableOpacity
                        style={{ backgroundColor: primaryColor, padding: 16, borderRadius: 8, alignItems: 'center' }}
                        onPress={() => setAccountDetailsModalVisible(true)}
                    >
                        <Text style={[tw`text-base font-bold`, { color: theme === 'light' ? '#FFFFFF' : '#000000' }]}>
                            Show Account Details
                        </Text>
                    </TouchableOpacity>
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
                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-75`}>
                    <View style={[tw`w-11/12 p-5 rounded-xl`, { backgroundColor: cardBackgroundColor }]}>
                        <View style={tw`flex-row justify-between items-center w-full`}>
                            <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>
                                Account Details
                            </Text>
                            <TouchableOpacity
                                style={tw`p-2`}
                                onPress={() => setAccountDetailsModalVisible(false)}
                            >
                                <Icon name="x" size={28} color={textColor} />
                            </TouchableOpacity>
                        </View>
                        {/* Account Details Text */}
                        {!loading && <View style={tw`my-4`}>
                            <AccountDetail title='Account Holder' content={user.name} />
                            <AccountDetail title='Account Number' content={account.id} />
                            <AccountDetail title='Type' content={account.type} />
                            <AccountDetail title='Status' content={account.status} />
                        </View>}
                        <ModalButton title="Share" onPress={generatePDF} iconName="share" />
                    </View>
                </View>
            </Modal>
        </View >
        </SafeAreaView>
    );
};

export default Receive;
