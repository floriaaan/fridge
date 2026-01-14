import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthLayout } from "@/components/auth-layout";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import Snackbar, { SnackbarRef } from "@/components/ui/snackbar";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const router = useRouter();
  const snackbarRef = useRef<SnackbarRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    try {
      await authClient.signUp.email(data);
      router.replace("/(tabs)");
    } catch (error: any) {
      snackbarRef.current?.show(error?.message || "Sign up failed", 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                className="p-2 rounded-lg active:bg-gray-100"
              >
                <Ionicons name="chevron-back" size={24} color="#1f2937" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-900 flex-1 ml-2">
                Sign Up
              </Text>
            </Animated.View>

            <View className="flex-1 justify-center px-6">
              {/* Title Section */}
              <Animated.View
                entering={FadeInUp.duration(600).delay(100)}
                className="mb-8"
              >
                <Text className="text-4xl font-bold text-gray-900 mb-2">
                  Create account
                </Text>
                <Text className="text-lg text-gray-600">
                  Join us to start managing your fridge smarter
                </Text>
              </Animated.View>

              {/* Form */}
              <Animated.View entering={FadeInUp.duration(600).delay(200)}>
                {/* Name Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Name
                  </Text>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="relative">
                        <TextInput
                          placeholder="Your full name"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          autoCapitalize="words"
                          className={`bg-white border-2 ${errors.name ? "border-red-400" : "border-gray-200"} rounded-xl px-4 py-3 text-gray-900`}
                        />
                        {errors.name && (
                          <View className="absolute right-3 top-3">
                            <Ionicons
                              name="alert-circle"
                              size={20}
                              color="#f87171"
                            />
                          </View>
                        )}
                      </View>
                    )}
                  />
                  {errors.name && (
                    <Text className="text-red-500 text-sm mt-1 ml-1">
                      {errors.name.message}
                    </Text>
                  )}
                </View>

                {/* Email Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Email
                  </Text>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="relative">
                        <TextInput
                          placeholder="your.email@example.com"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          className={`bg-white border-2 ${errors.email ? "border-red-400" : "border-gray-200"} rounded-xl px-4 py-3 text-gray-900`}
                        />
                        {errors.email && (
                          <View className="absolute right-3 top-3">
                            <Ionicons
                              name="alert-circle"
                              size={20}
                              color="#f87171"
                            />
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
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Password
                  </Text>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="relative">
                        <TextInput
                          placeholder="Create a secure password"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          secureTextEntry
                          className={`bg-white border-2 ${errors.password ? "border-red-400" : "border-gray-200"} rounded-xl px-4 py-3 text-gray-900`}
                        />
                        {errors.password && (
                          <View className="absolute right-3 top-3">
                            <Ionicons
                              name="alert-circle"
                              size={20}
                              color="#f87171"
                            />
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

                {/* Sign Up Button */}
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
                        Create Account
                      </Text>
                      <Ionicons name="person-add" size={20} color="white" />
                    </>
                  )}
                </TouchableOpacity>

                {/* Sign In Link */}
                <View className="flex-row justify-center items-center">
                  <Text className="text-gray-600 text-base">
                    Already have an account?{" "}
                  </Text>
                  <Link href="/(auth)/sign-in" asChild>
                    <TouchableOpacity>
                      <Text className="text-blue-600 font-semibold text-base">
                        Sign In
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
