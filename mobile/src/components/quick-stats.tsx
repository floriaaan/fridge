import React from 'react';
import { View, Text } from 'react-native';
import { useProducts } from '@/hooks/use-products';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function QuickStats() {
  const { data: products } = useProducts();

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
      label: 'Expired',
      icon: 'alert-circle-outline',
      bgClass: 'bg-red-50',
      textClass: 'text-red-700',
      iconColor: '#DC2626',
    },
    {
      id: 'expiring',
      value: expiringSoon,
      label: 'Expiring Soon',
      icon: 'time-outline',
      bgClass: 'bg-amber-50',
      textClass: 'text-amber-700',
      iconColor: '#D97706',
    },
    {
      id: 'opened',
      value: opened,
      label: 'Opened',
      icon: 'open-outline',
      bgClass: 'bg-purple-50',
      textClass: 'text-purple-700',
      iconColor: '#9333EA',
    },
  ];

  return (
    <Animated.View
      entering={FadeInUp.duration(600).delay(200).springify().damping(100).stiffness(600)}
      className="p-4 bg-gray-100"
    >
      <View className="px-2 pb-4">
        <Text className="text-xl font-bold text-gray-900">
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
