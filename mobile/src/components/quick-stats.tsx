import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { useProducts } from '@/hooks/use-products';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from '@/hooks/use-translation';

export function QuickStats() {
  const { data: products } = useProducts();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const expiringSoon = products?.filter(p => {
    if (!p.expiresAt) return false;
    const expiry = new Date(p.expiresAt);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }).length || 0;

  const expired = products?.filter(p => {
    if (!p.expiresAt) return false;
    return new Date(p.expiresAt) < new Date();
  }).length || 0;

  const opened = products?.filter(p => p.openedAt).length || 0;

  const stats = [
    {
      id: 'expired',
      value: expired,
      label: t("fridge.expired"),
      icon: 'alert-circle-outline',
      bgClass: 'bg-red-50 dark:bg-red-950',
      textClass: 'text-red-700 dark:text-red-400',
      iconColor: isDark ? '#F87171' : '#DC2626',
    },
    {
      id: 'expiring',
      value: expiringSoon,
      label: t("fridge.expiringSoon"),
      icon: 'time-outline',
      bgClass: 'bg-amber-50 dark:bg-amber-950',
      textClass: 'text-amber-700 dark:text-amber-400',
      iconColor: isDark ? '#FBBF24' : '#D97706',
    },
    {
      id: 'opened',
      value: opened,
      label: t("product.opened"),
      icon: 'open-outline',
      bgClass: 'bg-purple-50 dark:bg-purple-950',
      textClass: 'text-purple-700 dark:text-purple-400',
      iconColor: isDark ? '#C084FC' : '#9333EA',
    },
  ];

  return (
    <Animated.View
      entering={FadeInUp.duration(600).delay(200).springify().damping(100).stiffness(600)}
      className="p-4 bg-neutral-100 dark:bg-neutral-800"
    >
      <View className="px-2 pb-4">
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Quick Stats
        </Text>
      </View>
      <View className="flex-row gap-3">
        {stats.map((stat, index) => (
          <Animated.View
            key={stat.id}
            entering={FadeInUp.duration(400).delay(300 + index * 100).springify().damping(100).stiffness(600)}
            className={`flex-1 rounded-2xl p-4 items-center justify-center ${stat.bgClass}`}
          >
            <View className="mb-2">
              <Ionicons name={stat.icon as any} size={28} color={stat.iconColor} />
            </View>
            <Text className={`text-3xl font-bold ${stat.textClass}`}>
              {stat.value}
            </Text>
            <Text className={`text-xs text-center mt-2 font-medium ${stat.textClass} opacity-70`}>
              {stat.label}
            </Text>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}
