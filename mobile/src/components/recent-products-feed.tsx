import React from 'react';
import { View, Text } from 'react-native';
import { useProducts } from '@/hooks/use-products';
import Animated, { FadeInUp } from 'react-native-reanimated';

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export function RecentProductsFeed() {
  const { data: products } = useProducts();
  
  const recentProducts = products
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4) || [];

  return (
    <Animated.View
      entering={FadeInUp.duration(600).delay(400)}
      className="flex-1 p-4 bg-gray-100"
    >
      <View className="px-2 pb-4">
        <Text className="text-lg font-bold text-gray-900">
          Recent
        </Text>
      </View>
      <View className="gap-y-3">
        {recentProducts.length > 0 ? (
          recentProducts.map((product, index) => (
            <Animated.View
              key={product.id}
              entering={FadeInUp.duration(400).delay(500 + index * 100)}
              className="flex-row items-start gap-3"
            >
              {/* Small dot */}
              <View className="w-2 h-2 bg-gray-400 rounded-full mt-2" />
              
              {/* Content */}
              <View className="flex-1">
                <Text className="font-medium text-gray-900" numberOfLines={1}>
                  {product.name}
                </Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <Text className="text-xs text-gray-500">
                    {product.quantity} {product.unit}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {product.category}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {formatTimeAgo(product.createdAt)}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))
        ) : (
          <Text className="text-sm text-gray-500 text-center py-4">
            No products added yet
          </Text>
        )}
      </View>
    </Animated.View>
  );
}
