import React from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useResponsive } from '@/hooks/use-responsive';
import welcomeAnimation from '../../assets/lottie/welcome.json';

type AuthLayoutProps = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const { isTablet, isLandscape } = useResponsive();

  if (isTablet && isLandscape) {
    return (
      <View className="flex-1 flex-row bg-gradient-to-r from-white to-gray-50">
        <View className="flex-1 justify-center items-center p-12 border-r border-gray-200">
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
            className="items-center"
          >
            <Text className="text-5xl font-bold text-gray-900 mb-3">
              Fridge Companion
            </Text>
            <Text className="text-lg text-gray-600 text-center">
              Manage your fridge smarter
            </Text>
          </Animated.View>
        </View>
        <View className="flex-1">{children}</View>
      </View>
    );
  }

  return <>{children}</>;
}
