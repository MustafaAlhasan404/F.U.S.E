import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import QRCodeStyled from 'react-native-qrcode-styled';
import { RNCamera, BarCodeReadEvent } from 'react-native-camera';
import BottomTab from '../Components/BottomTab'; // Import BottomTab
import { useTheme } from '../ThemeContext'; // Import useTheme

const QrCodeFunctionality: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [scan, setScan] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const { theme } = useTheme(); // Use the theme

  const handleBarCodeRead = (e: BarCodeReadEvent) => {
    setResult(e.data);
    setScan(false);
    Alert.alert("QR Code Scanned", `QR Code data: ${e.data}`);
  };

  const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
  const textColor = theme === 'light' ? '#1F1F1F' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.content, { backgroundColor }]}>
        <Text style={[styles.header, { color: textColor }]}>QR Code Functionality</Text>
        <QRCodeStyled
          data={'1234567890abcdefghijklmnopqrstuvwxyz'}
          style={{ backgroundColor: 'white' }}
          padding={20}
          pieceSize={8}
          pieceCornerType='rounded'
          pieceBorderRadius={3}
          isPiecesGlued={true}
        />

        {scan ? (
          <RNCamera
            style={styles.preview}
            onBarCodeRead={handleBarCodeRead}
            captureAudio={false}
          >
            <Text style={[styles.camText, { color: textColor }]}>Scanning for QR Codes...</Text>
          </RNCamera>
        ) : (
          <View style={styles.buttonContainer}>
            <Button title="Start Scanning" onPress={() => setScan(true)} />
            <Text style={[styles.resultText, { color: textColor }]}>Scanned Result: {result}</Text>
          </View>
        )}
      </View>
      <BottomTab navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 22,
    marginBottom: 20,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 400,
    width: '100%'
  },
  camText: {
    backgroundColor: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    padding: 10,
    fontSize: 20
  },
  buttonContainer: {
    marginTop: 20,
  },
  resultText: {
    marginTop: 20,
    fontSize: 16,
  }
});

export default QrCodeFunctionality;
