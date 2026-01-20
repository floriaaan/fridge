import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { useTranslation } from "@/hooks/use-translation";
import { Colors } from "@/lib/constants/theme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: t("tabs.shoppingList"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.products"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fast-food" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="recipes"
        options={{
          title: t("tabs.recipes"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Statistics',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="debug"
        options={{
          title: t("tabs.debug"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bug" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
