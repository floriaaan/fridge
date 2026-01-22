import React from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useResponsive } from '@/hooks/use-responsive';
import { useTranslation } from '@/hooks/use-translation';
import welcomeAnimation from '../../assets/lottie/welcome.json';

type AuthLayoutProps = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const { isTablet, isLandscape } = useResponsive();
  const { t } = useTranslation();

  if (isTablet && isLandscape) {
    return (
      <View className="flex-1 flex-row bg-neutral-50 dark:bg-black">
        <View className="flex-1 justify-center items-center p-12 border-r border-neutral-200 dark:border-neutral-700">
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
            <Text className="text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
              {t("settings.fridgeCompanion")}
            </Text>
            <Text className="text-lg text-neutral-600 dark:text-neutral-400 text-center">
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
