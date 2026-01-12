import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { type Product } from "@/api/fetch-products";
import { ProductCard } from "@/components/product-card";
import { Chip } from "@/components/ui/chip";

type FridgeListProps = {
  products: Product[];
  refresh: () => void;
  isLoading: boolean;
};

export function FridgeList({ products, refresh, isLoading }: FridgeListProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<"expiring" | "asc">("asc");

  const sortedProducts = products.sort((a, b) => {
    if (activeFilter === "expiring") {
      const dateA = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
      const dateB = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
      return dateA - dateB;
    } else if (activeFilter === "asc") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const handleProductPress = (product: Product) => {
    console.log("Product pressed:", product.openfoodfactData);
    // Navigate to product detail or edit screen
    // navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleAddProduct = () => {
    router.push("/product/scan");
  };

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor="black"
          />
        }
      >
        <View className="flex flex-row items-center gap-1 mb-4 px-4">
          <Chip
            label="Expiring soon"
            isActive={activeFilter === "expiring"}
            onPress={() => setActiveFilter("expiring")}
          />
          <Chip
            label="Alphabetical"
            isActive={activeFilter === "asc"}
            onPress={() => setActiveFilter("asc")}
          />
        </View>
        <View className="flex flex-row flex-wrap flex-1 px-4 gap-4">
          {sortedProducts.length > 0 ? (
            sortedProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => handleProductPress(product)}
                index={index}
              />
            ))
          ) : (
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-gray-500 text-lg">No products found.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-5 left-5 right-5">
        <TouchableOpacity
          onPress={handleAddProduct}
          className="bg-black py-4 rounded-xl shadow-xl items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-lg">
            Add a product
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
