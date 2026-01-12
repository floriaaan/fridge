import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

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


  return (
    <>
      <View
        className="px-4 pb-4 flex-row items-center justify-between "
        style={{ paddingTop: insets.top  }}
      >
        <View className="flex-row items-center gap-2">
          {showBackButton && (
            <Pressable
              onPress={() => router.back()}
              className="mr-3 p-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" color={"#000"} size={24} />
            </Pressable>
          )}
          {session && (
            <Image
              source={{ uri: session.user?.image || undefined }}
              className="w-12 h-12 rounded-full"
            />
          )}
          {title && (
            <Text className="text-black text-4xl font-bold">{title}</Text>
          )}
        </View>
      </View>
    </>
  );
}
