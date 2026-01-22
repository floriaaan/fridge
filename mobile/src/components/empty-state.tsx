import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type EmptyStateProps = {
  icon: string;
  title: string;
  subtitle: string;
  marginTop?: string;
};

export function EmptyState({
  icon,
  title,
  subtitle,
  marginTop = "mt-20",
}: EmptyStateProps) {
  const isDark = useColorScheme() === "dark";

  return (
    <View className={`flex-1 items-center justify-center ${marginTop} px-6`}>
      <Ionicons
        name={icon as any}
        size={48}
        color={isDark ? "#525252" : "#d4d4d4"}
        style={{ marginBottom: 12 }}
      />
      <Text className="text-neutral-500 dark:text-neutral-400 text-lg font-medium mb-1">
        {title}
      </Text>
      <Text className="text-neutral-400 dark:text-neutral-500 text-sm text-center">
        {subtitle}
      </Text>
    </View>
  );
}
