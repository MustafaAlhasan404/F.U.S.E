import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StatusBar, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { useTheme } from '../ThemeContext';
import BottomTab from '../Components/BottomTab';
import ExpenseGraph from '../Components/ExpenseGraph';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import axios from 'axios';
import baseUrl from "../baseUrl"
import { decryptData } from '../crypto-utils';
import { PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Feather';


const dummyExpenses = [
  { id: '1', category: 'Rent/Mortgage', amount: 3500 },
  { id: '2', category: 'Healthcare', amount: 1200 },
  { id: '3', category: 'Insurance', amount: 300 },
  { id: '4', category: 'Utilities', amount: 215 },
  { id: '5', category: 'Food/Groceries', amount: 460 },
  { id: '6', category: 'Transportation', amount: 320 },
  { id: '7', category: 'Personal Spending', amount: 975 },
  { id: '8', category: 'Home Goods', amount: 1820 },
];

const advice = [
  {
    "id": 0,
    "advice": "Your savings are lower than the recommended 20%. You are saving 10%"
  },
  {
    "id": 1,
    "advice": "You need to reduce your spending on Transportation by $200"
  },
  {
    "id": 2,
    "advice": "You need to reduce your spending on Personal Spending by $500"
  },
  {
    "id": 3,
    "advice": "You need to reduce your spending on Home Goods by $700"
  },
]

const expenseData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [50, 20, 100, 75, 30, 90],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
      strokeWidth: 2 // optional
    }
  ],
};

const pieChartData = [
  { name: 'Rent/Mortgage', amount: 24, color: '#f00', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  { name: 'Healthcare', amount: 12, color: '#0f0', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  { name: 'Insurance', amount: 7, color: '#00f', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  { name: 'Utilities', amount: 5, color: '#ff0', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  { name: 'Food/Groceries', amount: 10, color: '#0ff', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  { name: 'Transportation', amount: 14, color: '#f0f', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  { name: 'Personal Spending', amount: 15, color: '#800000', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  { name: 'Personal Spending', amount: 8, color: '#A52A2A', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  { name: 'Home Goods', amount: 5, color: '#8A2BE2', legendFontColor: '#7F7F7F', legendFontSize: 15 }
];

const MyExpenses: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
  const textColor = theme === 'light' ? '#333333' : '#DDDDDD'; // More vibrant text color
  const cardBackgroundColor = theme === 'light' ? '#F0F0F0' : '#424242';
  const amountColor = theme === 'light' ? '#181E20' : '#94B9C5';

  const jwt = useSelector((state: RootState) => state.auth.jwt);
  const aesKey = useSelector((state: RootState) => state.auth.aesKey);
  const role = useSelector((state: RootState) => state.auth.role);
  const user = useSelector((state: RootState) => state.auth.user);

  const titleStyle = [tw`text-2xl font-bold mb-4`, { color: textColor }];
  const suggestionTitleStyle = [tw`text-lg font-bold mb-1`, { color: textColor }];
  const suggestionTextStyle = [tw`text-sm`, { color: textColor }];
  const expenseItemStyle = [tw`text-lg`, { color: textColor }];
  const expenseAmountStyle = [tw`text-lg font-bold`, { color: amountColor }];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.post(`${baseUrl}/user/expenses`, { jwt });
        const decryptedPayload = decryptData(response.data.payload, aesKey);
        console.log(decryptedPayload);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);



  const primaryColor = theme === 'light' ? '#006e63' : '#65e991';
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardWidth = Dimensions.get('window').width * 0.85;
  const cardSpacing = 10;

  const [expertLoading, setExpertLoading] = useState(true);
  const [prophetLoading, setProphetLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExpertLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProphetLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + cardSpacing));
    setCurrentIndex(index);
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor }]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />
      <View style={tw`flex-1 p-4`}>
        <Text style={titleStyle}>My Expenses</Text>
        {expertLoading && <View style={tw`flex-col h-1/2 w-full justify-center items-center`}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ color: textColor }}>The Expert System is loading your recommendations</Text>
        </View>}
        {!expertLoading && <View>
          <View style={[tw`rounded-lg p-3 mb-2`, { backgroundColor: cardBackgroundColor }]}>
            <Text style={suggestionTitleStyle}>Your Expert Analysis</Text>
            <Text style={suggestionTextStyle}>
              Our Expert System has analysed your expenses and has generated these stats.
            </Text>
            <View>
              <View style={tw`flex-row justify-center`}>
                <PieChart
                  data={pieChartData}
                  width={350}
                  height={220}
                  chartConfig={{
                    backgroundColor: backgroundColor,
                    backgroundGradientFrom: backgroundColor,
                    backgroundGradientTo: backgroundColor,
                    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="5"
                // absolute
                />
              </View>
            </View>
          </View>
          <View style={tw`w-full items-center`}>
            <FlatList
              data={advice}
              horizontal
              key={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[tw`p-6 rounded-xl`, { backgroundColor: cardBackgroundColor, width: cardWidth, marginHorizontal: cardSpacing / 2 }]}>
                  <View style={tw`flex-row items-center mb-2`}>
                    <Icon name={"info"} size={15} color={primaryColor} />
                    <Text style={[tw`text-base ml-2`, { color: textColor }]}>Expert Advice</Text>
                  </View>
                  <Text style={[tw`text-xl`, { color: textColor }]}>{item.advice}</Text>
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth + cardSpacing}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: cardSpacing / 2 }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
            <View style={tw`flex-row justify-center mt-4`}>
              {advice.map((_, index) => (
                <View
                  key={index}
                  style={[
                    tw`h-2 w-2 rounded-full mx-1`,
                    {
                      backgroundColor: currentIndex === index ? primaryColor : '#D3D3D3',
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>}
        {prophetLoading && <View style={tw`flex-col h-1/4 w-full justify-center items-center`}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ color: textColor }}>Prophet is loading your forecast</Text>
        </View>}
        {!prophetLoading && <View style={[tw`rounded-lg p-3 mt-4`, { backgroundColor: cardBackgroundColor }]}>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={suggestionTitleStyle}>Projected Expenses</Text>
            <Text style={[tw`text-sm`, { color: textColor }]}>By 31/07/2024</Text>
          </View>
          <FlatList
            data={dummyExpenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={tw`flex-row justify-between mb-1`}>
                <Text style={expenseItemStyle}>{item.category}</Text>
                <Text style={expenseAmountStyle}>${item.amount}</Text>
              </View>
            )}
          />
        </View>
        }
      </View>
      <BottomTab navigation={navigation} />
    </View>
  )
}

export default MyExpenses
