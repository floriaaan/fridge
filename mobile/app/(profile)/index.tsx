import React from "react";
import { Text, View, ScrollView, useColorScheme, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import Header from "@/components/ui/header";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { authClient } from "@/lib/auth-client";
import { useTranslation } from "@/hooks/use-translation";

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  index: number;
  color?: string;
}

function MenuItem({ icon, title, description, onPress, index, color = "#10b981" }: MenuItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(100 + index * 50)}
    >
      <AnimatedPressable
        onPress={onPress}
        className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4 mb-3 flex-row items-center"
      >
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {title}
          </Text>
          <Text className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {description}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? "#a3a3a3" : "#6b7280"}
        />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session } = authClient.useSession();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-neutral-100 dark:bg-black">
      <Header title={t("tabs.profile") || "Profile"} showBackButton />

      <ScrollView className="flex-1">
        {/* User Info Card */}
        <Animated.View
          entering={FadeInUp.duration(400)}
          className="mx-4 mt-4 mb-6 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl p-6"
        >
          <View className="flex-row items-center">
            {session?.user?.image ? (
              <Image
                source={{ uri: session.user.image }}
                style={{ width: 64, height: 64, borderRadius: 32 }}
                className="mr-4 border-2 border-white"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mr-4">
                <Ionicons name="person" size={32} color="white" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">
                {session?.user?.name || "User"}
              </Text>
              <Text className="text-white/80 text-sm mt-1">
                {session?.user?.email || ""}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Menu Items */}
        <View className="px-4">
          <MenuItem
            icon="trophy"
            title={t("tabs.gamification") || "Achievements"}
            description={t("profile.gamificationDescription") || "Badges, challenges, and leaderboard"}
            onPress={() => router.push("/(profile)/gamification")}
            index={0}
            color="#f59e0b"
          />

          <MenuItem
            icon="stats-chart"
            title={t("tabs.statistics") || "Statistics"}
            description={t("profile.statisticsDescription") || "View your waste reduction progress"}
            onPress={() => router.push("/(profile)/statistics")}
            index={1}
            color="#06b6d4"
          />

          <MenuItem
            icon="settings"
            title={t("tabs.settings") || "Settings"}
            description={t("profile.settingsDescription") || "Manage your account and preferences"}
            onPress={() => router.push("/(profile)/settings")}
            index={2}
            color="#6b7280"
          />
        </View>

        {/* Bottom Padding */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
