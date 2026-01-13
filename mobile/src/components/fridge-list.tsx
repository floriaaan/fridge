import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { type Product } from "@/api/fetch-products";
import { ProductCard } from "@/components/product-card";
import { Chip } from "@/components/ui/chip";
import { GradientChip } from "@/components/ui/gradient-chip";

type FridgeListProps = {
  products: Product[];
  refresh: () => void;
  isLoading: boolean;
};

export function FridgeList({ products, refresh, isLoading }: FridgeListProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<
    "expiring" | "asc" | "category"
  >("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const sortedProducts = products.sort((a, b) => {
    if (activeFilter === "expiring") {
      const dateA = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
      const dateB = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
      return dateA - dateB;
    } else if (activeFilter === "asc") {
      return a.name.localeCompare(b.name);
    } else if (activeFilter === "category") {
      return a.category.localeCompare(b.category);
    }
    return 0;
  });

  const filteredProducts = sortedProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: `/product/[id]`,
      params: { id: product.id, product: JSON.stringify(product) },
    });
  };

  const handleAddProduct = () => {
    router.push("/product/scan");
  };

  const handleGenerateRecipe = () => {
    router.push("/recipe/generate");
  };

  return (
    <>
      <ScrollView
        horizontal
        className="flex-grow-0"
        contentContainerClassName="flex items-center gap-1 flex flex-row mb-4 px-4 h-12"
        showsHorizontalScrollIndicator={false}
      >
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
        <Chip
          label="Category"
          isActive={activeFilter === "category"}
          onPress={() => setActiveFilter("category")}
        />
        <GradientChip
          label="AI Recipe"
          onPress={handleGenerateRecipe}
          icon={<Ionicons name="sparkles" size={16} />}
        />
      </ScrollView>
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
        <View className="px-4 mb-4">
          <View className="flex-row items-center bg-gray-200 rounded-xl px-4 py-3">
            <MaterialIcons name="search" size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              onChangeText={setSearchQuery}
              value={searchQuery}
              placeholder="Search products..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
        <View className="flex flex-col flex-1 px-4 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
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
          testID="add-product-button"
        >
          <Text className="text-white font-semibold text-lg">
            Add a product
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
