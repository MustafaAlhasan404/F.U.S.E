//delete
import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

const PromotionalBanner = () => {
  const containerStyle = [
    tw`p-5 rounded-lg my-5 shadow-lg w-11/12`,
    { backgroundColor: '#FFD700', shadowColor: '#000' },
  ];
  const messageStyle = [tw`text-lg font-bold text-center`, { color: '#000' }];

  return (
    <View style={tw`flex-1 items-center justify-center w-full`}>
      <View style={containerStyle}>
        <Text style={messageStyle} numberOfLines={2} adjustsFontSizeToFit>
          Get 10% cashback on all purchases this month!
        </Text>
      </View>
    </View>
  );
};

export default PromotionalBanner;
