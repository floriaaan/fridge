import React from 'react';
import { View, Text } from 'react-native';
import { useProducts } from '@/domain/hooks/use-products';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function QuickStats() {
  const { data: products } = useProducts();

  const totalItems = products?.reduce((acc, product) => acc + product.quantity, 0) || 0;
  const uniqueCategories = new Set(products?.map(p => p.category)).size;

  return (
    <Animated.View
      entering={FadeInUp.duration(600).delay(200)}
      className="p-6 bg-white border-l border-gray-200"
    >
      <Text className="text-2xl font-bold text-gray-900 mb-6">
        Quick Stats
      </Text>
      <View className="gap-y-5">
        <View className="flex-row items-center bg-gray-50 p-4 rounded-xl">
          <Ionicons name="apps-outline" size={28} color="#3b82f6" />
          <View className="ml-4">
            <Text className="text-4xl font-bold text-gray-800">
              {totalItems}
            </Text>
            <Text className="text-base text-gray-600">
              Total Items
            </Text>
          </View>
        </View>
        <View className="flex-row items-center bg-gray-50 p-4 rounded-xl">
          <Ionicons name="pricetags-outline" size={28} color="#10b981" />
          <View className="ml-4">
            <Text className="text-4xl font-bold text-gray-800">
              {uniqueCategories}
            </Text>
            <Text className="text-base text-gray-600">
              Unique Categories
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
