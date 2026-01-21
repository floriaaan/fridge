import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import welcomeAnimation from "@/../assets/lottie/welcome.json";
import { useTranslation } from '@/hooks/use-translation';


export default function AuthIndexScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center px-6 md:max-w-2xl md:mx-auto w-full">
          {/* Animation */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(100)}
            className="mb-8"
          >
            <LottieView
              source={welcomeAnimation}
              autoPlay
              loop
              style={{ width: 200, height: 200 }}
            />
          </Animated.View>

          {/* Title */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(300)}
            className="items-center mb-12"
          >
            <Text className="text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 leading-relaxed text-center">
              {t("settings.fridgeCompanion")}
            </Text>
            <Text className="text-lg text-neutral-600 dark:text-neutral-400 text-center">
              Manage your fridge smarter
            </Text>
          </Animated.View>

          {/* CTA Button */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(500)}
            className="w-full"
          >
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity
                className="bg-blue-600 rounded-2xl py-4 px-6 flex-row items-center justify-center active:bg-blue-700 mb-4"
                activeOpacity={0.8}
              >
                <Text className="text-white text-lg font-semibold mr-2">
                  Get Started
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </Link>
          </Animated.View>

          {/* Sign Up Link */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(600)}
            className="flex-row justify-center items-center"
          >
            <Text className="text-neutral-600 dark:text-neutral-400 text-base">
              {"Already have an account? "}
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 font-semibold text-base">
                  {t("auth.signIn")}
                </Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
          <Animated.View 
          entering={FadeInUp.duration(600).delay(700)}
          className="mt-8"
        >
          <Text className="text-neutral-500 dark:text-neutral-400 text-sm text-center">
            Track expiration dates • Reduce food waste • Save money
          </Text>
        </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
