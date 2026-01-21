import React from 'react';
import { View, Text } from 'react-native';
import { useProducts } from '@/hooks/use-products';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from '@/hooks/use-translation';

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
  const { t } = useTranslation();
  
  const recentProducts = products
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4) || [];

  return (
    <Animated.View
      entering={FadeInUp.duration(600).delay(400)}
      className="flex-1 p-4 bg-neutral-100 dark:bg-neutral-800"
    >
      <View className="px-2 pb-4">
        <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
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
              <View className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mt-2" />
              
              {/* Content */}
              <View className="flex-1">
                <Text className="font-medium text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
                  {product.name}
                </Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                    {product.quantity} {product.unit}
                  </Text>
                  <Text className="text-xs text-neutral-400 dark:text-neutral-500">
                    {product.category}
                  </Text>
                  <Text className="text-xs text-neutral-400 dark:text-neutral-500">
                    {formatTimeAgo(product.createdAt)}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))
        ) : (
          <Text className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
            {t("fridge.noProductsFound")}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}
