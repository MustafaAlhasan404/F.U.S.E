import React, { useState, useEffect } from 'react';
import { StatusBar, View, Text, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../AppNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../ThemeContext';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateAesKey, encryptAesKey, encryptData, decryptData } from '../crypto-utils';
import axios from 'axios';
import TextInput from "../Components/TextInput";
import tw from 'twrnc';
import { useDispatch } from 'react-redux';
import { setAuthData, setAesKey } from '../Redux/slices/authSlice';
import baseUrl from '../baseUrl';
import {jwtDecode} from 'jwt-decode'; // Correct import

// Import the logos
import FuseLogo from '../assets/FuseLogo.png';
import WhiteLogo from '../assets/White-Logo-PNG.png';

// Type the navigation prop
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const Login = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { theme } = useTheme();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [aesKey, setLocalAesKey] = useState('');
  const [loading, setLoading] = useState(false);

  // Conditional styling based on theme
  const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
  const textColor = theme === 'light' ? '#1F1F1F' : '#FFFFFF';
  const borderColor = theme === 'light' ? '#CCCCCC' : '#444444';
  const placeholderColor = theme === 'light' ? '#999999' : '#A0A0A0';
  const buttonColor = theme === 'light' ? '#028174' : '#65e991';
  const buttonTextColor = theme === 'light' ? '#FFFFFF' : '#181E20';
  const linkColor = theme === 'light' ? '#028174' : '#65e991';

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);

      const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
      if (savedBiometrics) {
        const useBiometrics = await AsyncStorage.getItem('useBiometrics');
        setUseBiometrics(useBiometrics === 'true');
      }
    })();
  }, []);

  const handleBiometricAuth = async () => {
    const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
    if (!savedBiometrics) return Alert.alert('Biometric record not found', 'Please login with your password');

    const { success } = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login with Biometrics',
      fallbackLabel: 'Enter Password',
    });

    if (success) {
      try {
        const savedEmail = await AsyncStorage.getItem('userEmail');
        const savedPassword = await AsyncStorage.getItem('userPassword');

        if (savedEmail && savedPassword) {
          await handleLoginWithSavedCredentials(savedEmail, savedPassword);
        } else {
          Alert.alert('Error', 'No saved credentials found');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to login with biometrics');
      }
    } else {
      Alert.alert('Authentication failed', 'Please try again');
    }
  };

  const handleLoginWithSavedCredentials = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/key/publicKey`, { email });
      const { publicKey } = response.data;

      const aesKey = generateAesKey();
      dispatch(setAesKey({
        aesKey: aesKey,
      }));
      setLocalAesKey(aesKey);

      const encryptedAesKey = encryptAesKey(publicKey, aesKey);

      const response2 = await axios.post(`${baseUrl}/key/setAESkey`, { email, encryptedAesKey });
      if (response2.status === 200) {
        const payload = encryptData({ email, password }, aesKey);
        const response3 = await axios.post(`${baseUrl}/auth/login`, { email, payload });
        const decryptedPayload = decryptData(response3.data.payload, aesKey);

        // Decode the JWT to get the user's role
        const decodedToken: any = jwtDecode(decryptedPayload.jwt);
        const userRole = decodedToken.role;

        // Check if the user's role is "Vendor"
        if (userRole !== 'Vendor') {
          Alert.alert('Error', 'Only users with the Vendor role can log in');
          setLoading(false);
          return;
        }

        dispatch(setAuthData({
          jwt: decryptedPayload.jwt,
          role: decryptedPayload.user.role,
          user: {
            id: decryptedPayload.user.id,
            name: decryptedPayload.user.name,
            email: decryptedPayload.user.email,
            checkingNumber: decryptedPayload.userAccounts.id,
          }
        }));

        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login with saved credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginStep1 = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/key/publicKey`, { email });
      const { publicKey } = response.data;

      const aesKey = generateAesKey();
      dispatch(setAesKey({
        aesKey: aesKey,
      }));
      setLocalAesKey(aesKey);

      const encryptedAesKey = encryptAesKey(publicKey, aesKey);

      const response2 = await axios.post(`${baseUrl}/key/setAESkey`, { email, encryptedAesKey });
      if (response2.status === 200) {
        setStep(2);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate login process');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginStep2 = async () => {
    setLoading(true);
    try {
      const payload = encryptData({ email, password }, aesKey);
      const response = await axios.post(`${baseUrl}/auth/login`, { email, payload });
      const decryptedPayload = decryptData(response.data.payload, aesKey);

      // Decode the JWT to get the user's role
      const decodedToken: any = jwtDecode(decryptedPayload.jwt);
      const userRole = decodedToken.role;

      // Check if the user's role is "Vendor"
      if (userRole !== 'Vendor') {
        Alert.alert('Error', 'Only users with the Vendor role can log in');
        setLoading(false);
        return;
      }

      dispatch(setAuthData({
        jwt: decryptedPayload.jwt,
        role: decryptedPayload.user.role,
        user: {
          id: decryptedPayload.user.id,
          name: decryptedPayload.user.name,
          email: decryptedPayload.user.email,
          checkingNumber: decryptedPayload.userAccounts.id,
        }
      }));

      // Save email and password to AsyncStorage
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPassword', password);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <StatusBar backgroundColor={backgroundColor} barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
      <View style={{ width: '100%', maxWidth: 400, padding: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: textColor }}>
            Login
          </Text>
          <Image source={theme === 'light' ? FuseLogo : WhiteLogo} style={{ width: 50, height: 50 }} />
        </View>

        {step === 1 ? (
          <>
            <Text style={[tw`text-sm pl-2 mb-1`, { color: textColor }]}>Email</Text>
            <TextInput
              style={[tw`flex-row mb-4`]}
              onChangeText={(text) => setEmail(text)}
              placeholder="Email"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              autoCapitalize='none'
            />
            <TouchableOpacity
              style={{ backgroundColor: buttonColor, padding: 16, borderRadius: 8, alignItems: 'center' }}
              onPress={handleLoginStep1}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={buttonTextColor} />
              ) : (
                <Text style={{ color: buttonTextColor, fontSize: 20, fontWeight: 'bold' }}>
                  Next
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View>
            <Text style={[tw`text-sm pl-2 mb-1`, { color: textColor }]}>Password</Text>
            <View style={[tw`flex-row mb-4 items-center`]}>
              <TextInput
                style={[tw`flex-row w-grow`]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                textContentType="password"
                autoComplete="password"
                placeholder='Password'
                autoCapitalize='none'
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={{ padding: 8 }}>
                <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={24} color={placeholderColor} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: buttonColor, padding: 16, borderRadius: 8, alignItems: 'center' }}
              onPress={handleLoginStep2}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={buttonTextColor} />
              ) : (
                <Text style={{ color: buttonTextColor, fontSize: 20, fontWeight: 'bold' }}>
                  Login
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <Text style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: textColor }}>
          Don't have an account?
          <Text style={{ color: linkColor, fontWeight: 'bold' }} onPress={() => navigation.navigate('Signup')}>
            {' '}Sign up
          </Text>
        </Text>
      </View>

      {isBiometricSupported && useBiometrics && (
        <TouchableOpacity
          style={tw`absolute bottom-10 flex-row items-center`}
          onPress={handleBiometricAuth}
        >
          <Icon name="account-lock-open" size={30} color={textColor} />
          <Text style={[tw`text-sm ml-1`, { color: textColor }]}>
            Login with Biometrics
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Login;
