import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Modal, Switch, Alert, Image } from 'react-native';
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

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

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
          onPress: () => { },
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

  const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
  const textColor = theme === 'light' ? '#1F1F1F' : '#FFFFFF';
  const cardBackgroundColor = theme === 'light' ? '#F0F0F0' : '#424242';
  const buttonColor = theme === 'light' ? '#028174' : '#65e991';
  const buttonTextColor = theme === 'light' ? '#FFFFFF' : '#181E20';
  const placeholderColor = theme === 'light' ? '#999999' : '#A0A0A0';

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const ProfileButton = ({ title, icon, onPress }: { title: string, icon: string, onPress: () => void }) => (
    <TouchableOpacity style={tw`py-3 flex-row items-center`} onPress={onPress}>
      <Icon name={icon} size={24} color={textColor} style={tw`mr-3`} />
      <Text style={[tw`text-lg`, { color: textColor }]}>{title}</Text>
      <Icon name="chevron-right" size={24} color={textColor} style={tw`ml-auto`} />
    </TouchableOpacity>
  );

  return (
    <View style={[tw`flex-1`, { backgroundColor }]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />
      <ScrollView contentContainerStyle={tw`flex-grow p-4`}>
        <Text style={[tw`text-2xl font-bold mb-6`, { color: textColor }]}>Profile</Text>
        
        <View style={tw`items-center mb-6`}>
          <Text style={[tw`text-2xl font-bold mb-1`, { color: textColor }]}>{user?.name}</Text>
          <Text style={[tw`text-lg mb-1`, { color: placeholderColor }]}>{user?.email}</Text>
          <Text style={[tw`text-sm`, { color: placeholderColor }]}>User ID: {user?.id}</Text>
        </View>

        <View style={[tw`mb-6 p-4 rounded-lg`, { backgroundColor: cardBackgroundColor }]}>
          <Text style={[tw`text-xl font-bold mb-3`, { color: textColor }]}>Account</Text>
          <ProfileButton title="Personal Information" icon="account-circle" onPress={() => setPersonalInfoModalVisible(true)} />
        </View>

        <View style={[tw`mb-6 p-4 rounded-lg`, { backgroundColor: cardBackgroundColor }]}>
          <Text style={[tw`text-xl font-bold mb-3`, { color: textColor }]}>Settings</Text>
          <View style={tw`py-3 flex-row justify-between items-center`}>
            <View style={tw`flex-row items-center`}>
              <Icon name="theme-light-dark" size={24} color={textColor} style={tw`mr-3`} />
              <Text style={[tw`text-lg`, { color: textColor }]}>Dark Theme</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
              trackColor={{ false: placeholderColor, true: buttonColor }}
              thumbColor={theme === 'dark' ? buttonTextColor : '#f4f3f4'}
            />
          </View>
          <View style={tw`py-3 flex-row justify-between items-center`}>
            <View style={tw`flex-row items-center`}>
              <Icon name="fingerprint" size={24} color={textColor} style={tw`mr-3`} />
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
          style={[tw`py-4 items-center rounded-lg`, { backgroundColor: '#FF3B30' }]}
          onPress={handleLogout}
        >
          <Text style={tw`text-white text-lg font-bold`}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomTab navigation={navigation} />

      {/* Personal Information Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={personalInfoModalVisible}
        onRequestClose={() => setPersonalInfoModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={[tw`w-11/12 p-5 rounded-lg`, { backgroundColor, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }]}>
            <TouchableOpacity
              style={tw`absolute top-2 right-2 p-2`}
              onPress={() => setPersonalInfoModalVisible(false)}
            >
              <Icon name="close" size={28} color={textColor} />
            </TouchableOpacity>
            <Text style={[tw`text-2xl font-bold mb-4 mt-4`, { color: textColor }]}>Personal Information</Text>
            <View style={tw`mb-4`}>
              <View style={tw`flex-row justify-between items-center mb-4 pb-2 border-b border-gray-300`}>
                <Text style={[tw`text-lg font-bold`, { color: textColor }]}>ID</Text>
                <Text style={[tw`text-lg`, { color: textColor }]}>{user?.id}</Text>
              </View>
              <View style={tw`flex-row justify-between items-center mb-4 pb-2 border-b border-gray-300`}>
                <Text style={[tw`text-lg font-bold`, { color: textColor }]}>Name</Text>
                <Text style={[tw`text-lg`, { color: textColor }]}>{user?.name}</Text>
              </View>
              <View style={tw`flex-row justify-between items-center mb-4 pb-2 border-b border-gray-300`}>
                <Text style={[tw`text-lg font-bold`, { color: textColor }]}>Email</Text>
                <Text style={[tw`text-lg`, { color: textColor }]}>{user?.email}</Text>
              </View>
              <View style={tw`flex-row justify-between items-center pb-2 border-b border-gray-300`}>
                <Text style={[tw`text-lg font-bold`, { color: textColor }]}>Phone</Text>
                <Text style={[tw`text-lg`, { color: textColor }]}>(123) 456-7890</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Profile;