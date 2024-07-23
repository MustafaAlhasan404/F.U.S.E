import React, { useState, useEffect } from 'react';
import { Keyboard, View, Text, ScrollView, TouchableOpacity, StatusBar, Modal, Switch, Alert, TouchableWithoutFeedback, SafeAreaView, Dimensions } from 'react-native';
import { useTheme } from '../ThemeContext';
import BottomTab from '../Components/BottomTab';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../AppNavigator';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import { LinearGradient } from 'expo-linear-gradient';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const { width: screenWidth } = Dimensions.get('window');

const Profile = () => {
  const { theme, setTheme } = useTheme();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const [personalInfoModalVisible, setPersonalInfoModalVisible] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    (async () => {
      const useBiometrics = await AsyncStorage.getItem('useBiometrics');
      setUseBiometrics(useBiometrics === 'true');
    })();
  }, []);

  const handleBiometricToggle = async (value: boolean) => {
    Alert.alert(
      'Enable Biometric Login',
      `Are you sure you want to ${value ? 'enable' : 'disable'} biometric login?`,
      [
        {
          text: 'No',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            setUseBiometrics(value);
            await AsyncStorage.setItem('useBiometrics', value.toString());
          },
        },
      ],
      { cancelable: false }
    );
  };

  const backgroundColor = theme === 'light' ? '#F5F7FA' : '#1A1A1A';
  const textColor = theme === 'light' ? '#1F1F1F' : '#FFFFFF';
  const cardBackgroundColor = theme === 'light' ? '#FFFFFF' : '#2C2C2C';
  const buttonColor = theme === 'light' ? '#028174' : '#65e991';
  const buttonTextColor = theme === 'light' ? '#FFFFFF' : '#181E20';
  const placeholderColor = theme === 'light' ? '#999999' : '#A0A0A0';

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const ProfileButton = ({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) => (
    <TouchableOpacity 
      style={tw`py-4 flex-row items-center border-b border-gray-200`} 
      onPress={onPress}
    >
      <Icon name={icon} size={24} color={buttonColor} style={tw`mr-4`} />
      <Text style={[tw`text-lg flex-1`, { color: textColor }]}>{title}</Text>
      <Icon name="chevron-right" size={24} color={placeholderColor} />
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1, backgroundColor }}>
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
          <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />
          <ScrollView contentContainerStyle={tw`flex-grow p-4`}>
            <Text style={[tw`text-3xl font-bold mb-8`, { color: textColor }]}>Profile</Text>
            
            <View style={tw`items-center mb-8`}>
              {/* <View style={tw`w-24 h-24 rounded-full bg-gray-300 mb-4`} /> */}
              <Text style={[tw`text-2xl font-bold mb-1`, { color: textColor }]}>{user?.name}</Text>
              <Text style={[tw`text-lg mb-1`, { color: placeholderColor }]}>{user?.email}</Text>
              <Text style={[tw`text-sm`, { color: placeholderColor }]}>User ID: {user?.id}</Text>
            </View>
  
            <View style={[tw`mb-6 p-5 rounded-xl`, { backgroundColor: cardBackgroundColor, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }]}>
              <Text style={[tw`text-xl font-bold mb-4`, { color: textColor }]}>Account</Text>
              <ProfileButton title="Personal Information" icon="account-circle" onPress={() => setPersonalInfoModalVisible(true)} />
            </View>
  
            <View style={[tw`mb-6 p-5 rounded-xl`, { backgroundColor: cardBackgroundColor, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }]}>
              <Text style={[tw`text-xl font-bold mb-4`, { color: textColor }]}>Settings</Text>
              <View style={tw`py-4 flex-row justify-between items-center border-b border-gray-200`}>
                <View style={tw`flex-row items-center`}>
                  <Icon name="theme-light-dark" size={24} color={buttonColor} style={tw`mr-4`} />
                  <Text style={[tw`text-lg`, { color: textColor }]}>Dark Theme</Text>
                </View>
                <Switch
                  value={theme === 'dark'}
                  onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
                  trackColor={{ false: placeholderColor, true: buttonColor }}
                  thumbColor={theme === 'dark' ? buttonTextColor : '#f4f3f4'}
                />
              </View>
              <View style={tw`py-4 flex-row justify-between items-center`}>
                <View style={tw`flex-row items-center`}>
                  <Icon name="fingerprint" size={24} color={buttonColor} style={tw`mr-4`} />
                  <Text style={[tw`text-lg`, { color: textColor }]}>Biometric Login</Text>
                </View>
                <Switch
                  value={useBiometrics}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: placeholderColor, true: buttonColor }}
                  thumbColor={useBiometrics ? buttonTextColor : '#f4f3f4'}
                />
              </View>
            </View>
  
            <TouchableOpacity
              style={[tw`py-4 items-center rounded-xl`, { backgroundColor: '#FF3B30' }]}
              onPress={handleLogout}
            >
              <Text style={tw`text-white text-lg font-bold`}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
        <BottomTab navigation={navigation} />
  
        <Modal
          animationType="slide"
          transparent={true}
          visible={personalInfoModalVisible}
          onRequestClose={() => setPersonalInfoModalVisible(false)}
        >
          <View style={tw`flex-1 justify-end`}>
            <TouchableWithoutFeedback onPress={() => setPersonalInfoModalVisible(false)}>
              <View style={tw`absolute inset-0 bg-black bg-opacity-50`} />
            </TouchableWithoutFeedback>
            <LinearGradient
              colors={theme === 'light' ? ['#FFFFFF', '#F0F0F0'] : ['#2C2C2C', '#1A1A1A']}
              style={[tw`w-full p-6 rounded-t-3xl`, { maxHeight: '80%' }]}
            >
              <View style={tw`flex-row justify-between items-center mb-6`}>
                <Text style={[tw`text-2xl font-bold`, { color: textColor }]}>Personal Information</Text>
                <TouchableOpacity onPress={() => setPersonalInfoModalVisible(false)}>
                  <Icon name="close" size={28} color={textColor} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <InfoItem label="ID" value={user?.id} />
                <InfoItem label="Name" value={user?.name} />
                <InfoItem label="Email" value={user?.email} />
                <InfoItem label="Phone" value={user?.checkingNumber} />
              </ScrollView>
            </LinearGradient>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? '#1F1F1F' : '#FFFFFF';
  
  return (
    <View style={tw`mb-4 pb-4 border-b border-gray-200`}>
      <Text style={[tw`text-sm mb-1`, { color: textColor + '80' }]}>{label}</Text>
      <Text style={[tw`text-lg`, { color: textColor }]}>{value}</Text>
    </View>
  );
};

export default Profile;