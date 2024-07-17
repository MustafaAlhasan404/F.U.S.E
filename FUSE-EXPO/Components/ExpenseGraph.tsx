import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import tw from 'twrnc';
import { useTheme } from '../ThemeContext';

interface ExpenseGraphProps {
  data: { labels: string[], datasets: { data: number[], color?: (opacity: number) => string }[] };
}

const ExpenseGraph: React.FC<ExpenseGraphProps> = ({ data }) => {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? '#181E20' : '#94B9C5'; // Updated text color for light and dark mode

  const chartConfig = {
    backgroundGradientFrom: theme === 'light' ? '#f9f9f9' : '#323232', // Light mode background similar to white
    backgroundGradientTo: theme === 'light' ? '#f9f9f9' : '#323232',   // Light mode background similar to white
    color: (opacity = 1) => theme === 'light' ? `rgba(24, 30, 32, ${opacity})` : `rgba(173, 216, 230, ${opacity})`, // Updated color for light mode
    labelColor: (opacity = 1) => theme === 'light' ? `rgba(24, 30, 32, ${opacity})` : `rgba(255, 255, 255, ${opacity})`, // Updated label color for light mode
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForBackgroundLines: {
      stroke: 'transparent', // Ensure background lines are transparent
    },
    propsForDots: {
      r: "3",
      strokeWidth: "2",
      stroke: theme === 'light' ? '#181E20' : '#94B9C5' // Updated color for light mode
    },
    fillShadowGradient: 'transparent', // Set the gradient under the line to transparent
    fillShadowGradientOpacity: 0 // Ensure the gradient under the line is fully transparent
  };

  // Ensure the dataset color is set to lighter blue
  const updatedData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      color: (opacity = 1) => theme === 'light' ? `rgba(24, 30, 32, ${opacity})` : `rgba(173, 216, 230, ${opacity})` // Updated color for light mode
    }))
  };

  return (
    <View style={tw`p-4`}>
      <Text style={[tw`text-lg font-bold mb-2`, { color: textColor }]}>Expense Trends</Text>
      <LineChart
        data={updatedData}
        width={Dimensions.get('window').width - 62} // from react-native
        height={220}
        chartConfig={chartConfig}
        bezier
        style={tw`rounded-lg bg-transparent`} // Ensure the chart itself has a transparent background
      />
    </View>
  );
};

export default ExpenseGraph;
