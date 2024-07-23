import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import tw from 'twrnc';

const CreditCard = ({ id, name, balance, cvv, expiry, backgroundImage }: { id: string, name: string, balance: number, cvv: number, expiry: string, backgroundImage: any }) => {
  return (
    <ImageBackground source={backgroundImage} style={tw`h-60 rounded-3xl my-2 py-4 px-6 flex-col justify-between`} imageStyle={tw`rounded-xl`}>
      <Text style={tw`ml-8 mt-2 text-base text-white font-bold uppercase`}>{name.toUpperCase()}</Text>
      <View style={tw`mt-4`}>
        <Text style={tw`text-2xl tracking-widest w-full text-center font-bold text-white`}>{id.replace(/(.{4})/g, '$1  ').trim()}</Text>
      </View>
      <View style={tw`flex-row justify-between items-center w-full`}>
        <View>
          <Text style={tw`text-sm text-white ml-1 font-bold`}>Balance</Text>
          <View style={tw`flex-row justify-start items-center`}>
            <Text style={tw`text-xl tracking-wide pl-1 text-white`}>{balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
          </View>
        </View>
        <View>
          <Text style={tw`text-sm text-white font-bold`}>Expiry</Text>
          <Text style={tw`text-xl tracking-wide text-white`}>{new Date(expiry).getMonth() + 1}/{new Date(expiry).getFullYear()}</Text>
        </View>
        <View>
          <Text style={tw`text-sm text-white font-bold`}>CVV</Text>
          <Text style={tw`text-xl tracking-wide text-white`}>{cvv}</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

export default CreditCard;
