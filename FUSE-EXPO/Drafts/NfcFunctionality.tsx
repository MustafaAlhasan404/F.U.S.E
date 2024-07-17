import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, Alert, Platform } from 'react-native';
import NfcManager, { NfcTech, NfcEvents, TagEvent, Ndef } from 'react-native-nfc-manager';
import BottomTab from '../Components/BottomTab'; // Import BottomTab
import { useTheme } from '../ThemeContext'; // Import useTheme

const NfcFunctionality = ({ navigation }: { navigation: any }) => {
  const [nfcSupported, setNfcSupported] = useState<boolean>(false);
  const [nfcEnabled, setNfcEnabled] = useState<boolean>(false);
  const [tagDetected, setTagDetected] = useState<boolean>(false);
  const [tagDetails, setTagDetails] = useState<string>('');
  const { theme } = useTheme(); // Use the theme

  useEffect(() => {
    async function initNfc() {
      const supported = await NfcManager.isSupported();
      setNfcSupported(supported);
      if (!supported) {
        return;
      }

      await NfcManager.start();
      const enabled = await NfcManager.isEnabled();
      setNfcEnabled(enabled);

      setupTagDetection();
    }

    initNfc();

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.unregisterTagEvent().catch(() => 0);
    };
  }, []);

  const setupTagDetection = async () => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: TagEvent) => {
      console.log('NFC Tag Detected:', tag);
      setTagDetected(true);
      setTagDetails(JSON.stringify(tag, null, 2)); // Store tag details in state
      if (Platform.OS === 'ios') {
        NfcManager.setAlertMessageIOS('NFC tag detected!');
      }
      NfcManager.unregisterTagEvent().catch(() => 0);
    });

    await NfcManager.registerTagEvent();
  };

  const handleCheckAgain = async () => {
    setTagDetected(false);
    setTagDetails('');
    await NfcManager.unregisterTagEvent();
    setupTagDetection();
  };

  const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
  const textColor = theme === 'light' ? '#1F1F1F' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor }]}>
        <Text style={[styles.header, { color: textColor }]}>NFC Functionality</Text>
        <Text style={[styles.status, { color: textColor }]}>
          {nfcSupported ? (nfcEnabled ? (tagDetected ? 'NFC Tag Detected' : 'No NFC Tag Detected') : 'NFC is not enabled') : 'NFC is not supported'}
        </Text>
        {tagDetected && (
          <View style={[styles.tagDetailsContainer, { backgroundColor: theme === 'light' ? '#E0E0E0' : '#505050' }]}>
            <Text style={[styles.subHeader, { color: textColor }]}>Tag Details:</Text>
            <Text style={[styles.details, { color: textColor }]}>{tagDetails}</Text>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <Button title="Write to NFC Tag" onPress={() => {}} color="#2196F3" />
          <Button title="Format NFC Tag" onPress={() => {}} color="#FF9800" />
          <Button title="Check Again" onPress={handleCheckAgain} color="#F44336" />
        </View>
      </ScrollView>
      <BottomTab navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  tagDetailsContainer: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  details: {
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
});

export default NfcFunctionality;
