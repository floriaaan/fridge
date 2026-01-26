import React from "react";
import { Text, View } from "react-native";
import { useProducts } from "@/hooks/use-products";
import { FridgeList } from "@/components/fridge-list";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/ui/header";
import { useResponsive } from "@/hooks/use-responsive";
import { QuickStats } from "@/components/quick-stats";
import { RecentProductsFeed } from "@/components/recent-products-feed";
import { useTranslation } from "@/hooks/use-translation";

export default function ProductsScreen() {
  const { data: products, isLoading, isError, error, refetch } = useProducts();
  const { isTablet, isLandscape } = useResponsive();
  const isTabletLandscape = isTablet && isLandscape;
  const { t } = useTranslation();

  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text className="text-neutral-900 dark:text-neutral-100">
          {t("common.error")}
        </Text>
        <Text className="text-neutral-500 dark:text-neutral-400">
          {error?.message}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-neutral-100 dark:bg-black"
    >
      <Header title={t("fridge.title")} hasAvatar />
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
