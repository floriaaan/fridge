import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import welcomeAnimation from '../../assets/lottie/welcome.json';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-white to-gray-50">
      <View className="flex-1 justify-center items-center px-6">
        <Animated.View entering={FadeInUp.duration(600).delay(100)}>
          <LottieView
            source={welcomeAnimation}
            autoPlay
            loop
            style={{ width: 280, height: 280 }}
          />
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(600).delay(300)}
          className="mb-12 items-center"
        >
          <Text className="text-5xl font-bold text-gray-900 mb-3">
            Fridge Companion
          </Text>
          <Text className="text-lg text-gray-600 text-center">
            Manage your fridge smarter
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.duration(600).delay(500)}
          className="w-full gap-4"
        >
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            className="w-full bg-blue-600 rounded-2xl py-4 px-6 active:bg-blue-700 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-semibold mr-2">
              Sign In
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-up')}
            className="w-full bg-white border-2 border-gray-200 rounded-2xl py-4 px-6 active:bg-gray-50 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-900 text-lg font-semibold mr-2">
              Create Account
            </Text>
            <Ionicons name="person-add" size={20} color="#1f2937" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.duration(600).delay(700)}
          className="mt-8"
        >
          <Text className="text-gray-500 text-sm text-center">
            Track expiration dates • Reduce food waste • Save money
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
