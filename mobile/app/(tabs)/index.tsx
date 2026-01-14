import React from "react";
import { Text, View } from "react-native";
import { useProducts } from "@/hooks/use-products";
import { FridgeList } from "@/components/fridge-list";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/ui/header";
import { useResponsive } from "@/hooks/use-responsive";
import { QuickStats } from "@/components/quick-stats";
import { RecentProductsFeed } from "@/components/recent-products-feed";

export default function ProductsScreen() {
  const { data: products, isLoading, isError, error, refetch } = useProducts();
  const { isTablet, isLandscape } = useResponsive();
  const isTabletLandscape = isTablet && isLandscape;

  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error fetching data</Text>
        <Text>{error?.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Header title="Fridge" />
      <View className="flex-1 flex-row">
        <View className="flex-1">
          <FridgeList
            products={products?.filter(({ quantity }) => quantity > 0) || []}
            refresh={refetch}
            isLoading={isLoading}
          />
        </View>
        {isTabletLandscape && (
          <View className="w-1/3 flex flex-col">
            <QuickStats />
            <RecentProductsFeed />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
