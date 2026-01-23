import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, Image, useColorScheme } from "react-native";
import { useRouter } from "expo-router";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { authClient } from "@/lib/auth-client";
import { AnimatedPressable } from "./animated-pressable";

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
  hasAvatar?: boolean;
}

export default function Header({
  showBackButton = false,
  title = "",
  hasAvatar = false,
}: HeaderProps) {
  const { data: session } = authClient.useSession();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <>
      <View
        className="px-4 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center gap-2">
          {showBackButton && (
            <AnimatedPressable
              onPress={() => router.back()}
              className="mr-3 p-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="chevron-back"
                color={isDark ? "#fafafa" : "#171717"}
                size={24}
              />
            </AnimatedPressable>
          )}
          {session && (
            session.user?.image ? (
              <Image
                source={{ uri: session.user.image }}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-neutral-300 dark:bg-neutral-700 items-center justify-center">
                <Ionicons
                  name="person"
                  color={isDark ? "#fafafa" : "#171717"}
                  size={20}
                />
              </View>
            )
          )}
          {title && (
            <Text className="text-neutral-900 dark:text-neutral-100 text-4xl font-bold">
              {title}
            </Text>
          )}
        </View>

        <View className="flex-row items-center gap-3">
          <AnimatedPressable
            onPress={() => router.push("/(tabs)/statistics")}
            className="p-2 rounded-lg"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="chart-box-outline"
              color={isDark ? "#fafafa" : "#171717"}
              size={20}
            />
          </AnimatedPressable>

          <AnimatedPressable
            onPress={() => router.push("/(tabs)/settings")}
            className="p-2 rounded-lg"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              color={isDark ? "#fafafa" : "#171717"}
              size={20}
            />
          </AnimatedPressable>
        </View>
      </View>
    </>
  );
}
