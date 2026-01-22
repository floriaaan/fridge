import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import Snackbar, { SnackbarRef } from "@/components/ui/snackbar";
import {
  setServerConfig,
  setOnboardingCompleted,
  getOfficialInstanceUrl,
  type ServerConfig,
} from "@/lib/server-config";
import { updateCachedConfig } from "@/lib/api-config";
import { reinitializeAuthClient } from "@/lib/auth-client";
import { useTranslation } from "@/hooks/use-translation";
import welcomeAnimation from "@/../assets/lottie/welcome.json";

type InstanceType = "official" | "self-hosted" | null;

export default function OnboardingScreen() {
  const router = useRouter();
  const snackbarRef = useRef<SnackbarRef>(null);
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [instanceType, setInstanceType] = useState<InstanceType>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const testServerConnection = async (url: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${url}/api/auth/ok`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log("Server connection test failed:", error);
      // Return false to indicate connection failed, user will see a warning
      return false;
    }
  };

  const handleValidateUrl = async () => {
    if (!customUrl.trim()) {
      snackbarRef.current?.show(t("onboarding.enterUrl"), 3000);
      return;
    }

    if (!validateUrl(customUrl)) {
      snackbarRef.current?.show(t("onboarding.invalidUrl"), 3000);
      return;
    }

    setIsValidating(true);
    const isConnected = await testServerConnection(customUrl);
    setIsValid(isConnected);
    setIsValidating(false);

    if (!isConnected) {
      snackbarRef.current?.show(t("onboarding.connectionFailed"), 3000);
    }
  };

  const handleContinue = async () => {
    if (instanceType === null) {
      snackbarRef.current?.show(t("onboarding.selectInstance"), 3000);
      return;
    }

    if (instanceType === "self-hosted") {
      if (!customUrl.trim() || !validateUrl(customUrl)) {
        snackbarRef.current?.show(t("onboarding.enterValidUrl"), 3000);
        return;
      }
    }

    setIsValidating(true);

    try {
      const config: ServerConfig = {
        baseUrl:
          instanceType === "official"
            ? getOfficialInstanceUrl()
            : customUrl.trim(),
        isOfficialInstance: instanceType === "official",
      };

      await setServerConfig(config);
      await setOnboardingCompleted(true);

      // Update the cached config and reinitialize auth client
      updateCachedConfig(config);
      reinitializeAuthClient();

      snackbarRef.current?.show(t("onboarding.configSaved"), 2000);

      setTimeout(() => {
        router.replace("/(auth)");
      }, 1000);
    } catch (error) {
      console.error("Error saving config:", error);
      snackbarRef.current?.show(t("onboarding.saveFailed"), 3000);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <View className="flex-1 px-6 pt-8 pb-12">
        {/* Header Animation */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(100)}
          className="items-center mb-6"
        >
          <LottieView
            source={welcomeAnimation}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
        </Animated.View>

        {/* Title */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(200)}
          className="items-center mb-8"
        >
          <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-2">
            {t("onboarding.welcome")}
          </Text>
          <Text className="text-base text-neutral-600 dark:text-neutral-400 text-center">
            {t("onboarding.chooseInstance")}
          </Text>
        </Animated.View>

        {/* Instance Selection */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(300)}
          className="gap-4 mb-8"
        >
          {/* Official Instance Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setInstanceType("official")}
            className={`p-5 rounded-2xl border-2 ${
              instanceType === "official"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View
                  className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                    instanceType === "official"
                      ? "bg-blue-500"
                      : "bg-neutral-100 dark:bg-neutral-700"
                  }`}
                >
                  <Ionicons
                    name="cloud"
                    size={24}
                    color={
                      instanceType === "official"
                        ? "white"
                        : isDark
                          ? "#a3a3a3"
                          : "#737373"
                    }
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-lg font-semibold ${
                      instanceType === "official"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-neutral-900 dark:text-neutral-100"
                    }`}
                  >
                    {t("onboarding.officialInstance")}
                  </Text>
                  <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {t("onboarding.officialDescription")}
                  </Text>
                </View>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  instanceType === "official"
                    ? "border-blue-500 bg-blue-500"
                    : "border-neutral-300 dark:border-neutral-600"
                }`}
              >
                {instanceType === "official" && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Self-Hosted Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setInstanceType("self-hosted")}
            className={`p-5 rounded-2xl border-2 ${
              instanceType === "self-hosted"
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View
                  className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                    instanceType === "self-hosted"
                      ? "bg-purple-500"
                      : "bg-neutral-100 dark:bg-neutral-700"
                  }`}
                >
                  <Ionicons
                    name="server"
                    size={24}
                    color={
                      instanceType === "self-hosted"
                        ? "white"
                        : isDark
                          ? "#a3a3a3"
                          : "#737373"
                    }
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-lg font-semibold ${
                      instanceType === "self-hosted"
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-neutral-900 dark:text-neutral-100"
                    }`}
                  >
                    {t("onboarding.selfHosted")}
                  </Text>
                  <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {t("onboarding.selfHostedDescription")}
                  </Text>
                </View>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  instanceType === "self-hosted"
                    ? "border-purple-500 bg-purple-500"
                    : "border-neutral-300 dark:border-neutral-600"
                }`}
              >
                {instanceType === "self-hosted" && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Custom URL Input (shown when self-hosted is selected) */}
        {instanceType === "self-hosted" && (
          <Animated.View entering={FadeInUp.duration(400)} className="mb-8">
            <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              {t("onboarding.serverUrl")}
            </Text>
            <View className="flex-row gap-2">
              <TextInput
                value={customUrl}
                onChangeText={(text) => {
                  setCustomUrl(text);
                  setIsValid(null);
                }}
                placeholder="https://your-server.com"
                placeholderTextColor={isDark ? "#737373" : "#a3a3a3"}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                className={`flex-1 bg-white dark:bg-neutral-800 px-4 py-3 rounded-xl border ${
                  isValid === false
                    ? "border-red-500"
                    : isValid === true
                      ? "border-green-500"
                      : "border-neutral-200 dark:border-neutral-700"
                } text-neutral-900 dark:text-neutral-100`}
              />
              <TouchableOpacity
                onPress={handleValidateUrl}
                disabled={isValidating}
                className="bg-purple-500 px-4 rounded-xl items-center justify-center"
              >
                {isValidating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>
            {isValid !== null && (
              <Text
                className={`text-sm mt-2 ${
                  isValid ? "text-green-600" : "text-red-600"
                }`}
              >
                {isValid
                  ? t("onboarding.urlValid")
                  : t("onboarding.urlInvalid")}
              </Text>
            )}
          </Animated.View>
        )}

        {/* Continue Button */}
        <View className="flex-1 justify-end">
          <Animated.View entering={FadeInUp.duration(600).delay(400)}>
            <TouchableOpacity
              onPress={handleContinue}
              disabled={isValidating || instanceType === null}
              activeOpacity={0.8}
              className={`py-4 px-6 rounded-2xl flex-row items-center justify-center ${
                instanceType === null || isValidating
                  ? "bg-neutral-300 dark:bg-neutral-700"
                  : "bg-blue-600"
              }`}
            >
              {isValidating ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-semibold mr-2">
                    {t("onboarding.continue")}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <Snackbar ref={snackbarRef} />
    </SafeAreaView>
  );
}
