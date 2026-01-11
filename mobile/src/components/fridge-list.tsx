import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { type Product } from "@/api/fetch-products";
import { ProductCard } from "@/components/product-card";

type FridgeListProps = {
  products: Product[];
  refresh: () => void;
  isLoading: boolean;
};

export function FridgeList({ products, refresh, isLoading }: FridgeListProps) {
  const handleProductPress = (product: Product) => {
    console.log("Product pressed:", product.name);
    // Navigate to product detail or edit screen
    // navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleAddProduct = () => {
    console.log("Add product pressed");
    // Navigate to add product screen
    // navigation.navigate('AddProduct');
  };

  return (
    <>
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap justify-between max-w-2xl mx-auto">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => handleProductPress(product)}
            />
          ))}
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
