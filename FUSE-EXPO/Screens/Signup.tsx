import React, { useState } from 'react';
import { StatusBar, View, Text, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../AppNavigator';
import { useTheme } from '../ThemeContext';
import axios from 'axios';
import TextInput from "../Components/TextInput";
import tw from 'twrnc';
import { useDispatch } from 'react-redux';
import { setAuthData, setAesKey } from '../Redux/slices/authSlice';
import baseUrl from '../baseUrl';
import { generateAesKey, encryptAesKey, encryptData, decryptData } from '../crypto-utils';
import Icon from 'react-native-vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import FuseLogo from '../assets/FuseLogo.png';
import WhiteLogo from '../assets/White-Logo-PNG.png'; // Import the white logo

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Signup'>;

const MerchantCategories = [
  'Rent/Mortgage',
  'Healthcare',
  'Insurance',
  'Utilities',
  'Food/Groceries',
  'Childcare',
  'Transportation',
  'Personal Spending',
  'Home Goods',
  'Clothing',
  'Pets',
  'Restaurants',
  'Travel & Entertainment',
  'Electronics',
  'Beauty Products',
  'Services',
  'Subscriptions',
];

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const isValidDate = (dateString: string): boolean => {
  const regex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;
  return regex.test(dateString);
};

const Signup = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birth, setbirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [role, setRole] = useState('Customer');
  const [workPermit, setWorkPermit] = useState('');
  const [category, setCategory] = useState(MerchantCategories[0]);
  const [step, setStep] = useState(1);
  const [aesKey, setLocalAesKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [hasEightChars, setHasEightChars] = useState(false);
  const [hasCapitalLetter, setHasCapitalLetter] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);

  const backgroundColor = theme === 'light' ? '#FFFFFF' : '#1A1A1A';
  const textColor = theme === 'light' ? '#1F1F1F' : '#FFFFFF';
  const borderColor = theme === 'light' ? '#CCCCCC' : '#444444';
  const placeholderColor = theme === 'light' ? '#999999' : '#A0A0A0';
  const buttonColor = theme === 'light' ? '#028174' : '#65e991';
  const buttonTextColor = theme === 'light' ? '#FFFFFF' : '#181E20';
  const linkColor = theme === 'light' ? '#028174' : '#65e991';

  const handleSignupStep1 = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/key/reg/publicKey`, { email });
      const { publicKey } = response.data;

      const aesKey = generateAesKey();
      dispatch(setAesKey({
        aesKey: aesKey,
      }));
      setLocalAesKey(aesKey);
      const encryptedAesKey = encryptAesKey(publicKey, aesKey);
      console.log(response.data.publicKey);
      const response2 = await axios.post(`${baseUrl}/key/reg/setAESkey`, { email, encryptedAesKey });
      if (response2.status === 200) {
        setStep(2);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate signup process');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupStep2 = () => {
    setStep(3);
  };

  const handleSignupStep3 = () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const formattedbirth = formatDate(birth);
    if (!isValidDate(formattedbirth)) {
      Alert.alert('Error', 'Invalid birth date format');
      return;
    }

    setStep(4);
  };

  const handleSignupStep4 = async () => {
    setLoading(true);
    try {
      const payload = encryptData({ email, name, password, phone, birth: formatDate(birth), monthlyIncome, role, workPermit, category }, aesKey);
      const response = await axios.post(`${baseUrl}/auth/register`, { email, payload });
      const decryptedPayload = decryptData(response.data.payload, aesKey);

      dispatch(setAuthData({
        jwt: decryptedPayload.jwt,
        role: decryptedPayload.role,
        user: {
          id: decryptedPayload.newUser.id,
          name: decryptedPayload.newUser.name,
          email: decryptedPayload.newUser.email,
        }
      }));
      console.log(decryptedPayload);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || birth;
    setShowDatePicker(false);
    setbirth(currentDate);
  };

  return (
    <View style={{ flex: 1, backgroundColor, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <StatusBar backgroundColor={backgroundColor} barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
      <View style={{ width: '100%', maxWidth: 400, padding: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={tw`flex-row items-center`}>
            {step != 1 &&
              <TouchableOpacity onPress={() => setStep(step - 1)} style={tw`mr-2`}>
                <Icon name="arrow-left" size={28} color={theme === 'light' ? '#000000' : '#FFFFFF'} />
              </TouchableOpacity>}
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: textColor }}>
              Sign Up
            </Text>
          </View>
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
              onPress={handleSignupStep1}
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
        ) : step === 2 ? (
          <>
            <Text style={[tw`text-sm pl-2 mb-1`, { color: textColor }]}>Name</Text>
            <TextInput
              style={[tw`flex-row mb-4`]}
              onChangeText={(text) => setName(text)}
              placeholder="Full Name"
              textContentType="name"
              autoComplete="name"
              value={name}
            />

            <Text style={[tw`text-sm pl-2 mb-1`, { color: textColor }]}>Phone</Text>
            <TextInput
              style={[tw`flex-row mb-4`]}
              onChangeText={(text) => setPhone(text)}
              placeholder="Phone"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              value={phone}
              maxLength={10}
            />

            <Text style={[tw`text-sm pl-2 mb-1`, { color: textColor }]}>Birth Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[tw`flex-row mb-4`, { borderColor, borderWidth: 1, padding: 12, borderRadius: 8 }]}>
              <Text style={{ color: textColor }}>{formatDate(birth)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={birth}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            <TouchableOpacity
              style={{ backgroundColor: buttonColor, padding: 16, borderRadius: 8, alignItems: 'center' }}
              onPress={handleSignupStep2}
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
        ) : step === 3 ? (
          <>
            <Text style={[tw`text-sm pl-2 mb-1`, { color: textColor }]}>Password</Text>
            <View style={[tw`flex-row mb-4 items-center`]}>
              <TextInput
                style={[tw`flex-row w-grow`]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setHasEightChars(text.length >= 8);
                  setHasCapitalLetter(text.match(/[A-Z]/g) ? true : false)
                  setHasNumber(text.match(/[0-9]/g) ? true : false)
                  setHasSpecialChar(text.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) ? true : false)
                }}
                secureTextEntry={!passwordVisible}
                textContentType="newPassword"
                autoComplete="new-password"
                placeholder='Password'
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={{ padding: 8 }}>
                <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={24} color={placeholderColor} />
              </TouchableOpacity>
            </View>
            <View style={tw`mb-2 -mt-2`}>
              {!hasEightChars && <View style={tw`flex-row items-center `}>
                <Icon name={hasEightChars ? "check" : "x"} size={15} color={textColor} />
                <Text style={[tw`text-xs ml-1`, { color: textColor }]}>Password must be at least 8 characters long</Text>
              </View>}
              {!hasCapitalLetter && <View style={tw`flex-row items-center `}>
                <Icon name={hasCapitalLetter ? "check" : "x"} size={15} color={textColor} />
                <Text style={[tw`text-xs ml-1`, { color: textColor }]}>Password must have at least one capital letter</Text>
              </View>}
              {!hasNumber && <View style={tw`flex-row items-center `}>
                <Icon name={hasNumber ? "check" : "x"} size={15} color={textColor} />
                <Text style={[tw`text-xs ml-1`, { color: textColor }]}>Password must be at least one number</Text>
              </View>}
              {!hasSpecialChar && <View style={tw`flex-row items-center `}>
                <Icon name={hasSpecialChar ? "check" : "x"} size={15} color={textColor} />
                <Text style={[tw`text-xs ml-1`, { color: textColor }]}>Password must have at least one special character</Text>
              </View>}
            </View>

            <Text style={[tw`text-sm pl-2 mb-1`, { color: textColor }]}>Confirm Password</Text>
            <View style={[tw`flex-row mb-4 items-center`]}>
              <TextInput
                style={[tw`flex-row w-grow`]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!confirmPasswordVisible}
                textContentType="newPassword"
                autoComplete="new-password"
                placeholder='Confirm Password'
              />
              <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)} style={{ padding: 8 }}>
                <Icon name={confirmPasswordVisible ? 'eye-off' : 'eye'} size={24} color={placeholderColor} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{ backgroundColor: buttonColor, padding: 16, borderRadius: 8, alignItems: 'center' }}
              onPress={handleSignupStep3}
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
          <>
            <Text style={[tw`text-sm pl-2 mb-1`, { color: textColor }]}>Role</Text>
            <Picker
              selectedValue={role}
              style={[tw`flex-row mb-4`, { color: textColor }]}
              onValueChange={(itemValue) => setRole(itemValue)}
            >
              <Picker.Item label="Customer" value="Customer" />
              <Picker.Item label="Merchant" value="Merchant" />
            </Picker>

            {role === 'Merchant' && (
              <>
                <Text style={[tw`text-sm pl-2 mb-1`, { color: textColor }]}>Work Permit</Text>
                <TextInput
                  style={[tw`flex-row mb-4`]}
                  onChangeText={(text) => setWorkPermit(text)}
                  placeholder="Work Permit"
                  textContentType="none"
                  autoComplete="off"
                />

                <Text style={[tw`text-sm pl-2 mb-1`, { color: textColor }]}>Category</Text>
                <Picker
                  selectedValue={category}
                  style={[tw`flex-row mb-4`, { color: textColor }]}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                >
                  {MerchantCategories.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </>
            )}

            {role === 'Customer' && (
              <>
                <Text style={[tw`text-sm pl-2 mb-1`, { color: textColor }]}>Monthly Income</Text>
                <TextInput
                  style={[tw`flex-row mb-4`]}
                  onChangeText={(text) => setMonthlyIncome(text)}
                  placeholder="Monthly Income"
                  keyboardType="numeric"
                  textContentType="none"
                  autoComplete="off"
                />
              </>
            )}

            <TouchableOpacity
              style={{ backgroundColor: buttonColor, padding: 16, borderRadius: 8, alignItems: 'center' }}
              onPress={handleSignupStep4}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={buttonTextColor} />
              ) : (
                <Text style={{ color: buttonTextColor, fontSize: 20, fontWeight: 'bold' }}>
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <Text style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: textColor }}>
          Already have an account?
          <Text style={{ color: linkColor, fontWeight: 'bold' }} onPress={() => navigation.navigate('Login')}>
            {' '}Login
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default Signup;
