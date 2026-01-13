import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
} from "react-native";
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
  const [activeFilter, setActiveFilter] = useState<"expiring" | "asc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiModalVisible, setAiModalVisible] = useState(false);

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

  const filteredProducts = sortedProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: `/product/${product.id}`,
      params: { product: JSON.stringify(product) },
    });
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
          <GradientChip
            label="AI Recipe"
            onPress={() => setAiModalVisible(true)}
          />
        </View>
        <View className="px-4 mb-4">
          <TextInput
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="bg-gray-100 rounded-xl px-4 py-3 text-lg"
          />
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAiModalVisible}
        onRequestClose={() => setAiModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-8 rounded-xl w-11/12">
            <Text className="text-2xl font-bold mb-4">AI Recipe Generator</Text>
            <Text className="text-lg mb-8">
              This feature is coming soon!
            </Text>
            <TouchableOpacity
              onPress={() => setAiModalVisible(false)}
              className="bg-black py-3 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-lg">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
