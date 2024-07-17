// import React, { useState } from 'react';
// import { View, Text, StatusBar, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
// import QRCodeStyled from 'react-native-qrcode-styled';
// import BottomTab from '../Components/BottomTab';
// import { useTheme } from '../ThemeContext';
// import tw from 'twrnc';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { useNavigation, NavigationProp } from '@react-navigation/native';
// import { RootStackParamList } from '../AppNavigator';
// import { RNCamera, BarCodeReadEvent } from 'react-native-camera';

// const Pay: React.FC = () => {
//     const { theme } = useTheme();
//     const [accountDetailsModalVisible, setAccountDetailsModalVisible] = useState<boolean>(false);
//     const [accountNumber, setAccountNumber] = useState<string>('');
//     const [amount, setAmount] = useState<string>('');
//     const [scan, setScan] = useState<boolean>(false);
//     const [result, setResult] = useState<string>('');
//     const navigation = useNavigation<NavigationProp<RootStackParamList>>();

//     const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
//     const textColor = theme === 'light' ? '#333333' : '#DDDDDD';
//     const cardBackgroundColor = theme === 'light' ? '#F0F0F0' : '#424242';
//     const buttonBackgroundColor = theme === 'light' ? '#94B9C5' : '#94B9C5';
//     const buttonTextColor = theme === 'light' ? '#FFFFFF' : '#000000';

//     const handleManualTransfer = () => {
//         Alert.alert("Manual Transfer", `Account Number: ${accountNumber}\nAmount: ${amount}`);
//     };

//     const handleBarCodeRead = (e: BarCodeReadEvent) => {
//         setResult(e.data);
//         setScan(false);
//         Alert.alert("QR Code Scanned", `QR Code data: ${e.data}`);
//     };

//     const CustomButton = ({ title, onPress, iconName }: { title: string, onPress: () => void, iconName: string }) => (
//         <TouchableOpacity
//             style={[
//                 tw`flex-row items-center justify-center w-full py-3 my-2 rounded-full`,
//                 {
//                     backgroundColor: buttonBackgroundColor,
//                     shadowColor: '#000',
//                     shadowOffset: { width: 0, height: 2 },
//                     shadowOpacity: 0.25,
//                     shadowRadius: 4,
//                     elevation: 5,
//                 },
//             ]}
//             onPress={onPress}
//         >
//             <Icon name={iconName} size={28} color={buttonTextColor} />
//             <Text style={[tw`text-xl font-bold ml-2`, { color: buttonTextColor }]}>{title}</Text>
//         </TouchableOpacity>
//     );

//     const AccountDetail = ({ title, content }: { title: string, content: string }) => (
//         <View style={tw`pb-4 pl-4`}>
//             <Text style={[tw`text-sm`, { color: textColor }]}>{title}</Text>
//             <Text style={[tw`font-bold text-2xl tracking-wide`, { color: textColor }]}>{content}</Text>
//         </View>
//     );

//     return (
//         <View style={[tw`flex-1 justify-between`, { backgroundColor }]}>
//             <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />
//             <View style={tw`m-4`}>
//                 <Text style={[tw`text-2xl font-bold mb-2 mt-5`, { color: theme === 'light' ? '#000000' : '#FFFFFF' }]}>Pay</Text>
//             </View>
//             <View style={tw`p-5`}>
//                 <View style={tw`mt-4`}>
//                     <Text style={[tw`text-xl font-semibold mb-2`, { color: textColor }]}>Manual Transfer</Text>
//                     <TextInput
//                         style={[tw`p-2 rounded-lg mb-4`, { backgroundColor: cardBackgroundColor, color: textColor }]}
//                         placeholder="Account Number"
//                         placeholderTextColor={theme === 'light' ? '#888' : '#aaa'}
//                         value={accountNumber}
//                         onChangeText={setAccountNumber}
//                     />
//                     <TextInput
//                         style={[tw`p-2 rounded-lg mb-4`, { backgroundColor: cardBackgroundColor, color: textColor }]}
//                         placeholder="Amount"
//                         placeholderTextColor={theme === 'light' ? '#888' : '#aaa'}
//                         value={amount}
//                         onChangeText={setAmount}
//                         keyboardType="numeric"
//                     />
//                     <CustomButton title="Transfer" onPress={handleManualTransfer} iconName="send" />
//                     <CustomButton title="Start QR Scanning" onPress={() => setScan(true)} iconName="qr-code-scanner" />
//                 </View>
//             </View>
//             <BottomTab navigation={navigation} />

//             <Modal
//                 animationType="slide"
//                 transparent={true}
//                 visible={accountDetailsModalVisible}
//                 onRequestClose={() => {
//                     setAccountDetailsModalVisible(!accountDetailsModalVisible);
//                 }}
//             >
//                 <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50 h-full`}>
//                     <View style={[tw`w-11/12 p-5 rounded-xl h-4/6 flex-col justify-between`, { backgroundColor: cardBackgroundColor }]}>
//                         <View style={tw`flex-row justify-between items-center w-full`}>
//                             <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>
//                                 Account Details
//                             </Text>
//                             <TouchableOpacity
//                                 style={tw`p-2`}
//                                 onPress={() => setAccountDetailsModalVisible(false)}
//                             >
//                                 <Icon name="x" size={28} color={textColor} />
//                             </TouchableOpacity>
//                         </View>
//                         <View style={tw`my-4`}>
//                             <AccountDetail title='Account Holder' content='John Doe' />
//                             <AccountDetail title='Account Number' content='1234 5678 9876 5432' />
//                             <AccountDetail title='Currency' content='Syrian Pound (SYP)' />
//                             <AccountDetail title='IBAN' content='282608010SY0000000000' />
//                         </View>
//                         <TouchableOpacity
//                             style={[tw`flex-row items-center justify-center py-3 mt-2 rounded-lg mx-1 px-4`, { backgroundColor: buttonBackgroundColor }]}
//                             onPress={
//                                 // Generate PDF/JPG and share code here
//                                 () => setAccountDetailsModalVisible(false)
//                             }
//                         >
//                             <Icon name={"share"} size={20} color={theme === 'light' ? '#FFFFFF' : '#000000'} />
//                             <Text style={[tw`text-base font-bold ml-2`, { color: theme === 'light' ? '#FFFFFF' : '#000000' }]}>Share</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </Modal>

//             {scan && (
//                 <Modal
//                     animationType="slide"
//                     transparent={true}
//                     visible={scan}
//                     onRequestClose={() => setScan(false)}
//                 >
//                     <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
//                         <View style={tw`w-full h-80`}>
//                             <RNCamera
//                                 style={tw`flex-1`}
//                                 onBarCodeRead={handleBarCodeRead}
//                                 captureAudio={false}
//                             >
//                                 <TouchableOpacity
//                                     style={[tw`absolute bottom-0 left-0 right-0 p-4`, { backgroundColor: buttonBackgroundColor }]}
//                                     onPress={() => setScan(false)}
//                                 >
//                                     <Text style={[tw`text-center text-xl font-bold`, { color: theme === 'light' ? '#FFFFFF' : '#000000' }]}>Cancel</Text>
//                                 </TouchableOpacity>
//                             </RNCamera>
//                         </View>
//                     </View>
//                 </Modal>
//             )}
//         </View>
//     );
// };

// export default Pay;
