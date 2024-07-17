// import React, { useState, useEffect } from 'react';
// import { View, Text, Alert, ScrollView, Platform, StatusBar, TouchableOpacity, Modal, TextInput } from 'react-native';
// import NfcManager, { NfcTech, NfcEvents, TagEvent } from 'react-native-nfc-manager';
// import QRCodeStyled from 'react-native-qrcode-styled';
// import { RNCamera, BarCodeReadEvent } from 'react-native-camera';
// import BottomTab from '../Components/BottomTab';
// import BalanceDisplay from '../Components/BalanceDisplay';
// import RecentTransactions from '../Components/RecentTransactions';
// import { useTheme } from '../ThemeContext';
// import tw from 'twrnc';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { useNavigation, NavigationProp } from '@react-navigation/native';
// import { RootStackParamList } from '../AppNavigator'; // Adjust the path as needed

// const MakeTransaction: React.FC = () => {
//   const [mode, setMode] = useState<'send' | 'request' | null>(null);
//   const [requestMethod, setRequestMethod] = useState<'qr' | 'nfc' | null>(null);
//   const [scan, setScan] = useState<boolean>(false);
//   const [result, setResult] = useState<string>('');
//   const [nfcSupported, setNfcSupported] = useState<boolean>(false);
//   const [nfcEnabled, setNfcEnabled] = useState<boolean>(false);
//   const [tagDetected, setTagDetected] = useState<boolean>(false);
//   const [tagDetails, setTagDetails] = useState<string>('');
//   const { theme } = useTheme();
//   const [sendModalVisible, setSendModalVisible] = useState<boolean>(false);
//   const [requestModalVisible, setRequestModalVisible] = useState<boolean>(false);
//   const [manualTransferModalVisible, setManualTransferModalVisible] = useState<boolean>(false);
//   const [accountNumber, setAccountNumber] = useState<string>('');
//   const [amount, setAmount] = useState<string>('');
//   const navigation = useNavigation<NavigationProp<RootStackParamList>>();

//   useEffect(() => {
//     async function initNfc() {
//       const supported = await NfcManager.isSupported();
//       setNfcSupported(supported);
//       if (!supported) return;

//       await NfcManager.start();
//       const enabled = await NfcManager.isEnabled();
//       setNfcEnabled(enabled);

//       setupTagDetection();
//     }

//     initNfc();

//     return () => {
//       NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
//       NfcManager.unregisterTagEvent().catch(() => 0);
//     };
//   }, []);

//   const setupTagDetection = async () => {
//     NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: TagEvent) => {
//       console.log('NFC Tag Detected:', tag);
//       setTagDetected(true);
//       setTagDetails(JSON.stringify(tag, null, 2));
//       if (Platform.OS === 'ios') {
//         NfcManager.setAlertMessageIOS('NFC tag detected!');
//       }
//       NfcManager.unregisterTagEvent().catch(() => 0);
//     });

//     await NfcManager.registerTagEvent();
//   };

//   const handleBarCodeRead = (e: BarCodeReadEvent) => {
//     setResult(e.data);
//     setScan(false);
//     Alert.alert("QR Code Scanned", `QR Code data: ${e.data}`);
//   };

//   const handleCheckAgain = async () => {
//     setTagDetected(false);
//     setTagDetails('');
//     await NfcManager.unregisterTagEvent();
//     setupTagDetection();
//   };

//   const handleManualTransfer = () => {
//     // Handle the manual transfer logic here
//     Alert.alert("Manual Transfer", `Account Number: ${accountNumber}\nAmount: ${amount}`);
//     setManualTransferModalVisible(false);
//     setSendModalVisible(false);
//     setMode(null);
//   };

//   const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
//   const textColor = theme === 'light' ? '#333333' : '#DDDDDD'; // More vibrant text color
//   const cardBackgroundColor = theme === 'light' ? '#F0F0F0' : '#424242';
//   const buttonBackgroundColor = theme === 'light' ? '#181E20' : '#94B9C5';
//   const buttonTextColor = theme === 'light' ? 'text-white' : 'text-black';

//   const titleStyle = [tw`text-2xl font-bold mb-4`, { color: textColor }];
//   const descriptionStyle = [tw`text-lg`, { color: textColor }];
//   const amountStyle = [tw`text-lg font-bold`, { color: textColor }];

//   const CustomButton = ({ title, onPress, iconName }: { title: string, onPress: () => void, iconName: string }) => (
//     <TouchableOpacity
//       style={[tw`flex-row items-center justify-center w-1/2 py-3 my-2 rounded-full mx-1`, { backgroundColor: buttonBackgroundColor }]}
//       onPress={onPress}
//     >
//       <Icon name={iconName} size={28} color={theme === 'light' ? '#FFFFFF' : '#000000'} />
//       <Text style={[tw`text-xl font-bold ml-2`, { color: theme === 'light' ? '#FFFFFF' : '#000000' }]}>{title}</Text>
//     </TouchableOpacity>
//   );

//   const ModalButton = ({ title, onPress, iconName }: { title: string, onPress: () => void, iconName: string }) => (
//     <TouchableOpacity
//       style={[tw`flex-row items-center justify-center py-3 my-2 rounded-full mx-1 px-4`, { backgroundColor: buttonBackgroundColor }]}
//       onPress={onPress}
//     >
//       <Icon name={iconName} size={28} color={theme === 'light' ? '#FFFFFF' : '#000000'} />
//       <Text style={[tw`text-xl font-bold ml-2`, { color: theme === 'light' ? '#FFFFFF' : '#000000' }]}>{title}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={[tw`flex-1`, { backgroundColor }]}>
//       <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />
//       <View style={tw`absolute top-0 left-0 m-4`}>
//         <Text style={[tw`text-xl font-bold mb-2`, { color: theme === 'light' ? '#000000' : '#FFFFFF' }]}>Make Transaction</Text>
//         <BalanceDisplay />
//       </View>
//       <ScrollView contentContainerStyle={tw`flex-grow p-5`}>
//         <View style={tw`flex-row w-full pr-5 mt-40 justify-between`}>
//           {!mode ? (
//             <>
//               <CustomButton title="Send" onPress={() => { setMode('send'); setSendModalVisible(true); }} iconName="send" />
//               <CustomButton title="Request" onPress={() => { setMode('request'); setRequestModalVisible(true); }} iconName="request-page" />
//             </>
//           ) : null}
//         </View>
//         <View style={tw`mt-4`}>
//           <RecentTransactions />
//         </View>
//         <View style={tw`mt-4 items-center`}>
//           <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
//             <Text style={[tw`text-lg font-bold`, { color: theme === 'light' ? '#181E20' : '#94B9C5' }]}>Show More</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//       <BottomTab navigation={navigation} />

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={sendModalVisible}
//         onRequestClose={() => {
//           setSendModalVisible(!sendModalVisible);
//           setMode(null); // Reset mode when closing the modal
//         }}
//       >
//         <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
//           <View style={[tw`w-11/12 p-5 rounded-lg`, { backgroundColor: cardBackgroundColor }]}>
//             <TouchableOpacity
//               style={tw`absolute top-2 right-2 p-2`}
//               onPress={() => { setSendModalVisible(false); setMode(null); }}
//             >
//               <Icon name="close" size={28} color={theme === 'light' ? '#000000' : '#FFFFFF'} />
//             </TouchableOpacity>
//             <Text style={[tw`text-xl font-semibold mb-2`, { color: textColor }]}>Send Payment</Text>
//             <ModalButton title="Manual Transfer" onPress={() => setManualTransferModalVisible(true)} iconName="account-balance" />
//             {scan ? (
//               <View style={tw`w-full h-80`}>
//                 <RNCamera
//                   style={tw`flex-1`}
//                   onBarCodeRead={handleBarCodeRead}
//                   captureAudio={false}
//                 >
//                   <TouchableOpacity
//                     style={[tw`absolute bottom-0 left-0 right-0 p-4`, { backgroundColor: buttonBackgroundColor }]}
//                     onPress={() => setScan(false)}
//                   >
//                     <Text style={[tw`text-center text-xl font-bold`, { color: theme === 'light' ? '#FFFFFF' : '#000000' }]}>Cancel</Text>
//                   </TouchableOpacity>
//                 </RNCamera>
//               </View>
//             ) : (
//               <View style={tw`w-full`}>
//                 <ModalButton title="Start QR Scanning" onPress={() => setScan(true)} iconName="qr-code-scanner" />
//                 {result ? (
//                   <View style={tw`mt-5 items-center`}>
//                     <Text style={[tw`text-lg font-bold`, { color: textColor }]}>Scanned Result: {result}</Text>
//                     <TouchableOpacity onPress={() => { /* Add your sending logic here */ }}>
//                       <Text style={[tw`text-lg font-bold mt-2`, { color: '#94B9C5' }]}>Send</Text>
//                     </TouchableOpacity>
//                   </View>
//                 ) : null}
//               </View>
//             )}
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={manualTransferModalVisible}
//         onRequestClose={() => {
//           setManualTransferModalVisible(!manualTransferModalVisible);
//         }}
//       >
//         <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
//           <View style={[tw`w-11/12 p-5 rounded-lg`, { backgroundColor: cardBackgroundColor }]}>
//             <TouchableOpacity
//               style={tw`absolute top-2 right-2 p-2`}
//               onPress={() => setManualTransferModalVisible(false)}
//             >
//               <Icon name="close" size={28} color={theme === 'light' ? '#000000' : '#FFFFFF'} />
//             </TouchableOpacity>
//             <Text style={[tw`text-xl font-semibold mb-2`, { color: textColor }]}>Manual Transfer</Text>
//             <TextInput
//               style={[tw`p-2 rounded-lg mb-4`, { backgroundColor: cardBackgroundColor, color: textColor }]}
//               placeholder="Account Number"
//               placeholderTextColor={theme === 'light' ? '#888' : '#aaa'}
//               value={accountNumber}
//               onChangeText={setAccountNumber}
//             />
//             <TextInput
//               style={[tw`p-2 rounded-lg mb-4`, { backgroundColor: cardBackgroundColor, color: textColor }]}
//               placeholder="Amount"
//               placeholderTextColor={theme === 'light' ? '#888' : '#aaa'}
//               value={amount}
//               onChangeText={setAmount}
//               keyboardType="numeric"
//             />
//             <ModalButton title="Transfer" onPress={handleManualTransfer} iconName="send" />
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={requestModalVisible}
//         onRequestClose={() => {
//           setRequestModalVisible(!requestModalVisible);
//           setMode(null); // Reset mode when closing the modal
//         }}
//       >
//         <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
//           <View style={[tw`w-11/12 p-5 rounded-lg`, { backgroundColor: cardBackgroundColor }]}>
//             <TouchableOpacity
//               style={tw`absolute top-2 right-2 p-2`}
//               onPress={() => { setRequestModalVisible(false); setMode(null); setRequestMethod(null); }}
//             >
//               <Icon name="close" size={28} color={theme === 'light' ? '#000000' : '#FFFFFF'} />
//             </TouchableOpacity>
//             <Text style={[tw`text-xl font-semibold mb-2`, { color: textColor }]}>Request Payment</Text>
//             <View style={tw`w-full mt-5`}>
//               <ModalButton title="Request via QR Code" onPress={() => setRequestMethod('qr')} iconName="qr-code" />
//               <ModalButton title="Request via NFC" onPress={() => setRequestMethod('nfc')} iconName="nfc" />
//             </View>
//             {requestMethod === 'qr' && (
//               <View style={tw`items-center mt-5`}>
//                 <Text style={tw`text-xl font-semibold mb-2 ${textColor}`}>Request Payment via QR Code</Text>
//                 <QRCodeStyled
//                   data={'1234567890abcdefghijklmnopqrstuvwxyz'}
//                   style={{ backgroundColor: 'white' }}
//                   padding={20}
//                   pieceSize={8}
//                   pieceCornerType='rounded'
//                   pieceBorderRadius={3}
//                   isPiecesGlued={true}
//                 />
//               </View>
//             )}
//             {requestMethod === 'nfc' && (
//               <View style={tw`items-center mt-5`}>
//                 <Text style={tw`text-xl font-semibold mb-2 ${textColor}`}>Request Payment via NFC</Text>
//                 {nfcSupported && nfcEnabled ? (
//                   <View style={tw`mt-5 items-center`}>
//                     <Text style={tw`text-lg mb-2 ${textColor}`}>
//                       {tagDetected ? 'NFC Tag Detected' : 'Waiting for NFC Tag...'}
//                     </Text>
//                     {tagDetected ? (
//                       <View style={[tw`w-full p-2 rounded mb-5`, { backgroundColor: cardBackgroundColor }]}>
//                         <Text style={tw`text-xl font-semibold mb-2 ${textColor}`}>Tag Details:</Text>
//                         <Text style={tw`text-lg ${textColor}`}>{tagDetails}</Text>
//                       </View>
//                     ) : null}
//                     <ModalButton title="Check NFC Again" onPress={handleCheckAgain} iconName="refresh" />
//                   </View>
//                 ) : null}
//               </View>
//             )}
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// export default MakeTransaction;
