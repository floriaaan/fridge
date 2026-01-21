import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, useColorScheme } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthLayout } from '@/components/auth-layout';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';

import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Snackbar, { SnackbarRef } from '@/components/ui/snackbar';
import { useTranslation } from '@/hooks/use-translation';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const router = useRouter();
  const snackbarRef = useRef<SnackbarRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { control, handleSubmit, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);
    try {
      await authClient.signIn.email(data);
      router.replace('/(tabs)');
    } catch (error: any) {
      snackbarRef.current?.show(error?.message || 'Sign in failed', 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <Animated.View 
              entering={FadeInDown.duration(400)}
              className="px-4 py-3 flex-row items-center"
            >
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 rounded-lg active:bg-neutral-100 dark:active:bg-neutral-800"
              >
                <Ionicons name="chevron-back" size={24} color={isDark ? "#fafafa" : "#171717"} />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex-1 ml-2">
                {t("auth.signIn")}
              </Text>
            </Animated.View>

            <View className="flex-1 justify-center px-6">
              {/* Title Section */}
              <Animated.View
                entering={FadeInUp.duration(600).delay(100)}
                className="mb-8"
              >
                <Text className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  Welcome back
                </Text>
                <Text className="text-lg text-neutral-600 dark:text-neutral-400">
                  Sign in to continue managing your fridge
                </Text>
              </Animated.View>

              {/* Form */}
              <Animated.View entering={FadeInUp.duration(600).delay(200)}>
                {/* Email Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    {t("auth.email")}
                  </Text>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="relative">
                        <TextInput
                          placeholder="your.email@example.com"
                          placeholderTextColor={isDark ? "#a3a3a3" : "#9ca3af"}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          className={`bg-white dark:bg-neutral-800 border-2 ${errors.email ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700'} rounded-xl px-4 py-3 text-neutral-900 dark:text-neutral-100`}
                        />
                        {errors.email && (
                          <View className="absolute right-3 top-3">
                            <Ionicons name="alert-circle" size={20} color="#f87171" />
                          </View>
                        )}
                      </View>
                    )}
                  />
                  {errors.email && (
                    <Text className="text-red-500 text-sm mt-1 ml-1">
                      {errors.email.message}
                    </Text>
                  )}
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    {t("auth.password")}
                  </Text>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="relative">
                        <TextInput
                          placeholder={t("auth.passwordPlaceholder")}
                          placeholderTextColor={isDark ? "#a3a3a3" : "#9ca3af"}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          secureTextEntry
                          className={`bg-white dark:bg-neutral-800 border-2 ${errors.password ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700'} rounded-xl px-4 py-3 text-neutral-900 dark:text-neutral-100`}
                        />
                        {errors.password && (
                          <View className="absolute right-3 top-3">
                            <Ionicons name="alert-circle" size={20} color="#f87171" />
                          </View>
                        )}
                      </View>
                    )}
                  />
                  {errors.password && (
                    <Text className="text-red-500 text-sm mt-1 ml-1">
                      {errors.password.message}
                    </Text>
                  )}
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  className="bg-blue-600 rounded-2xl py-4 px-6 active:bg-blue-700 flex-row items-center justify-center mb-4"
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text className="text-white text-lg font-semibold mr-2">
                        {t("auth.signIn")}
                      </Text>
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </>
                  )}
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View className="flex-row justify-center items-center">
                  <Text className="text-neutral-600 dark:text-neutral-400 text-base">
                    {"Don't have an account? "}
                  </Text>
                  <Link href="/(auth)/sign-up" asChild>
                    <TouchableOpacity>
                      <Text className="text-blue-600 font-semibold text-base">
                        {t("auth.signUp")}
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Snackbar ref={snackbarRef} />
      </SafeAreaView>
    </AuthLayout>
  );
}
