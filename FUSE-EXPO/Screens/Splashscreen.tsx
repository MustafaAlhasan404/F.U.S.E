import React, { useEffect, useRef } from 'react';
import { View, StatusBar, Animated, Easing, Image, Dimensions } from 'react-native';
import tw from 'twrnc';
import { useTheme } from '../ThemeContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Splashscreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    const fadeValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(0.9)).current;
    const translateY = useRef(new Animated.Value(50)).current;
    const rotateValue = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(width / 2)).current;

    useEffect(() => {
        const entryAnimation = Animated.parallel([
            Animated.timing(fadeValue, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(scaleValue, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(translateX, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]);

        const exitAnimation = Animated.parallel([
            Animated.timing(fadeValue, {
                toValue: 0,
                duration: 500,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
                toValue: 1.1,
                duration: 500,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(translateX, {
                toValue: -width / 2,
                duration: 500,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
                toValue: 1,
                duration: 500,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
        ]);

        Animated.sequence([
            entryAnimation,
            Animated.delay(1500),
            exitAnimation,
        ]).start(() => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }],
            });
        });
    }, [navigation, fadeValue, scaleValue, translateY, rotateValue, translateX]);

    const rotate = rotateValue.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['0deg', '360deg', '0deg'],
    });

    const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
    const statusBarStyle = theme === 'light' ? 'dark-content' : 'light-content';

    const logoSource = theme === 'light' 
        ? require('../assets/FuseLogo.png') 
        : require('../assets/White-Logo-PNG.png');

    return (
        <View style={[tw`flex-1`, { backgroundColor }]}>
            <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
            <View style={tw`h-full w-full items-center justify-center overflow-hidden`}>
                <Animated.View style={{
                    opacity: fadeValue,
                    transform: [
                        { scale: scaleValue },
                        { translateY },
                        { rotate },
                        { translateX },
                    ],
                }}>
                    <Image
                        source={logoSource}
                        style={{
                            width: 150,
                            height: 150,
                        }}
                    />
                </Animated.View>
            </View>
        </View>
    );
};

export default Splashscreen;


// import React, { useEffect, useRef } from 'react';
// import { View, StatusBar, Animated, Easing, Image } from 'react-native';
// import tw from 'twrnc';
// import { useTheme } from '../ThemeContext';
// import { useNavigation } from '@react-navigation/native';

// const Splashscreen = () => {
//     const { theme } = useTheme();
//     const navigation = useNavigation();

//     const fadeValue = useRef(new Animated.Value(0)).current;
//     const scaleValue = useRef(new Animated.Value(0.8)).current;
//     const rotateValue = useRef(new Animated.Value(0)).current;
//     const slideValue = useRef(new Animated.Value(100)).current;

//     useEffect(() => {
//         const fadeInAnimation = Animated.timing(fadeValue, {
//             toValue: 1,
//             duration: 800,
//             easing: Easing.out(Easing.cubic),
//             useNativeDriver: true,
//         });

//         const scaleAnimation = Animated.spring(scaleValue, {
//             toValue: 1,
//             friction: 3,
//             tension: 40,
//             useNativeDriver: true,
//         });

//         const rotateAnimation = Animated.timing(rotateValue, {
//             toValue: 1,
//             duration: 1000,
//             easing: Easing.inOut(Easing.cubic),
//             useNativeDriver: true,
//         });

//         const slideAnimation = Animated.timing(slideValue, {
//             toValue: 0,
//             duration: 800,
//             easing: Easing.out(Easing.cubic),
//             useNativeDriver: true,
//         });

//         const exitAnimation = Animated.parallel([
//             Animated.timing(fadeValue, {
//                 toValue: 0,
//                 duration: 400,
//                 easing: Easing.in(Easing.cubic),
//                 useNativeDriver: true,
//             }),
//             Animated.timing(scaleValue, {
//                 toValue: 1.2,
//                 duration: 400,
//                 easing: Easing.in(Easing.cubic),
//                 useNativeDriver: true,
//             }),
//         ]);

//         Animated.sequence([
//             Animated.parallel([fadeInAnimation, scaleAnimation, rotateAnimation, slideAnimation]),
//             Animated.delay(500),
//             exitAnimation,
//         ]).start(() => {
//             navigation.reset({
//                 index: 0,
//                 routes: [{ name: 'Login' }],
//             });
//         });
//     }, [navigation, fadeValue, scaleValue, rotateValue, slideValue]);

//     const rotate = rotateValue.interpolate({
//         inputRange: [0, 1],
//         outputRange: ['0deg', '360deg'],
//     });

//     const backgroundColor = theme === 'light' ? '#FFFFFF' : '#303030';
//     const statusBarStyle = theme === 'light' ? 'dark-content' : 'light-content';

//     return (
//         <View style={[tw`flex-1`, { backgroundColor }]}>
//             <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
//             <View style={tw`h-full w-full items-center justify-center overflow-hidden`}>
//                 <Animated.View style={{
//                     opacity: fadeValue,
//                     transform: [
//                         { scale: scaleValue },
//                         { rotate },
//                         { translateY: slideValue },
//                     ],
//                 }}>
//                     <Image
//                         source={require('../assets/FuseLogo.png')}
//                         style={{
//                             width: 200,
//                             height: 200,
//                         }}
//                     />
//                 </Animated.View>
//             </View>
//         </View>
//     );
// };

// export default Splashscreen;

///////////////////////////////////////////////////////////////////////////////////////