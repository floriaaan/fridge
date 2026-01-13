import React from "react";
import { Product } from "@/api/fetch-products";
import { useUpdateProduct } from "@/hooks/use-update-product";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProductDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { product: productString } = params;
  let product: Product | null = null;
  try {
    product = JSON.parse(productString as string);
  } catch (error) {
    console.error("Failed to parse product data:", error);
    // Optionally, navigate back or show an error message
  }

  const [quantity, setQuantity] = React.useState(
    product?.quantity.toString() ?? ""
  );

  const updateProductMutation = useUpdateProduct();

  const handleUpdate = () => {
    updateProductMutation.mutate({
      id: product.id,
      quantity: parseInt(quantity, 10),
    });
  };
  const imageUrl =
    product.openfoodfactData?._j?.image_front_url ||
    product.openfoodfactData?._j?.image_url ||
    product.openfoodfactData?.image_url;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-64"
            resizeMode="cover"
          />
        )}
        <View className="p-4">
          <Text className="text-3xl font-bold">{product.name}</Text>
          <Text className="text-lg text-gray-500">{product.category}</Text>
          <Text className="mt-4 text-gray-700">
            Expires on: {new Date(product.expiresAt!).toLocaleDateString()}
          </Text>

          <View className="mt-8">
            <Text className="text-xl font-bold">Update Quantity</Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              className="mt-2 bg-gray-100 rounded-xl px-4 py-3 text-lg"
            />
            <TouchableOpacity
              onPress={handleUpdate}
              className="mt-4 bg-black py-4 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-lg">
                Update Product
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-8 bg-gray-200 py-4 rounded-xl items-center"
          >
            <Text className="text-black font-semibold text-lg">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
