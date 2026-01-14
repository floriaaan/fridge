import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "@/lib/api/fetch-products";
import { useUpdateProduct } from "@/hooks/use-update-product";

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    vegetables: "#10b981",
    dairy: "#3b82f6",
    meat: "#f97316",
    poultry: "#78350f",
    fruits: "#f59e0b",
    beverages: "#06b6d4",
    snacks: "#eab308",
    condiments: "#6b7280",
  };
  return colors[category.toLowerCase()] || "#8b5cf6";
};

const getCategoryBgColor = (category: string): string => {
  const colors: Record<string, string> = {
    vegetables: "#ecfdf5",
    dairy: "#eff6ff",
    meat: "#ffedd5",
    poultry: "#fef3c7",
    fruits: "#fffbeb",
    beverages: "#ecf9ff",
    snacks: "#fffef2",
    condiments: "#f9fafb",
  };
  return colors[category.toLowerCase()] || "#faf5ff";
};

const getExpiryStatus = (expiresAt: string | null) => {
  if (!expiresAt) return { text: "No expiry date", color: "#6b7280", bgColor: "#f3f4f6", urgency: "none" };
  
  const expiry = new Date(expiresAt);
  const today = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) {
    return { text: "Expired", color: "#dc2626", bgColor: "#fee2e2", urgency: "expired" };
  } else if (daysUntilExpiry === 0) {
    return { text: "Expires today", color: "#ea580c", bgColor: "#ffedd5", urgency: "critical" };
  } else if (daysUntilExpiry <= 3) {
    return { text: `${daysUntilExpiry} day${daysUntilExpiry > 1 ? "s" : ""} left`, color: "#dc2626", bgColor: "#fee2e2", urgency: "critical" };
  } else if (daysUntilExpiry <= 7) {
    return { text: `${daysUntilExpiry} days left`, color: "#ea580c", bgColor: "#ffedd5", urgency: "warning" };
  }
  return { text: `${daysUntilExpiry} days left`, color: "#10b981", bgColor: "#ecfdf5", urgency: "good" };
};

export default function ProductDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { product: productString } = params;
  let product: Product | null = null;
  try {
    product = JSON.parse(productString as string);
  } catch (error) {
    console.error("Failed to parse product data:", error);
  }

  const [quantity, setQuantity] = React.useState(
    product?.quantity.toString() ?? ""
  );
  const [isEditing, setIsEditing] = React.useState(false);

  const updateProductMutation = useUpdateProduct();

  if (!product) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500 text-lg">Produit non trouvé.</Text>
      </SafeAreaView>
    );
  }

  const handleUpdate = () => {
    if (!quantity || isNaN(parseInt(quantity, 10))) {
      return;
    }
    updateProductMutation.mutate(
      {
        id: product.id,
        quantity: parseInt(quantity, 10),
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const imageUrl =
    product.openfoodfactData?._j?.image_front_url ||
    product.openfoodfactData?._j?.image_url ||
    product.openfoodfactData?.image_url;

  const categoryColor = getCategoryColor(product.category);
  const categoryBgColor = getCategoryBgColor(product.category);
  const expiryStatus = getExpiryStatus(product.expiresAt);

  const headerComponent = (
    <Animated.View
      entering={FadeInDown.duration(400)}
      className="px-4 py-3 flex-row items-center"
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="p-2 rounded-lg active:bg-gray-100"
      >
        <Ionicons name="chevron-back" size={24} color="#1f2937" />
      </TouchableOpacity>
      <Text className="text-xl font-bold text-gray-900 flex-1 ml-2">
        Product Details
      </Text>
    </Animated.View>
  );

  const scrollContent = (
    <>
      {/* Image Section */}
      <Animated.View entering={FadeInUp.delay(100).duration(400)}>
        {imageUrl ? (
          <View className="w-full h-72 relative items-center justify-center">
            <ImageBackground
              source={{ uri: imageUrl }}
              className="w-full h-full absolute"
              resizeMode="cover"
              blurRadius={20}
              style={{ opacity: 0.5 }}
            />
            <View className="rounded-3xl overflow-hidden z-10">
              <Image
                source={{ uri: imageUrl }}
                className="w-56 h-56"
                resizeMode="contain"
              />
            </View>
          </View>
        ) : (
          <View className="w-full h-72 bg-gray-200 justify-center items-center">
            <Ionicons name="image-outline" size={60} color="#d1d5db" />
          </View>
        )}
      </Animated.View>

      {/* Content Section */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(400)}
        className="px-4 py-6 pb-20"
      >
        {/* Name and Category */}
        <View className="mb-4">
          <Text className="text-4xl font-bold text-gray-900 mb-3">
            {product.name}
          </Text>
          <View
            className="self-start px-3 py-1.5 rounded-full"
            style={{ backgroundColor: categoryBgColor }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: categoryColor }}
            >
              {product.category}
            </Text>
          </View>
        </View>

        {/* Expiry Status Card */}
        <View
          className="p-4 rounded-2xl mb-6 flex-row items-center justify-between"
          style={{ backgroundColor: expiryStatus.bgColor }}
        >
          <View className="flex-row items-center flex-1">
            <View
              className="w-3 h-3 rounded-full mr-3"
              style={{ backgroundColor: expiryStatus.color }}
            />
            <View>
              <Text className="text-xs text-gray-600 font-medium">Expiration</Text>
              <Text
                className="text-lg font-bold"
                style={{ color: expiryStatus.color }}
              >
                {expiryStatus.text}
              </Text>
            </View>
          </View>
          <Text className="text-gray-700 font-medium">
            {new Date(product.expiresAt!).toLocaleDateString("fr-FR", {
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Info Grid */}
        <View className="flex-row gap-3 mb-8">
          {/* Quantity */}
          <View className="flex-1 bg-white rounded-2xl p-4">
            <Text className="text-xs text-gray-600 font-medium mb-2">
              QUANTITY
            </Text>
            <Text className="text-2xl font-bold text-gray-900">
              {product.quantity}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">{product.unit}</Text>
          </View>

          {/* Location */}
          <View className="flex-1 bg-white rounded-2xl p-4">
            <Text className="text-xs text-gray-600 font-medium mb-2">
              LOCATION
            </Text>
            <View className="flex-row items-center gap-2">
              <Ionicons
                name={
                  product.location === "freezer"
                    ? "snow"
                    : product.location === "pantry"
                    ? "cube"
                    : "home"
                }
                size={20}
                color={categoryColor}
              />
              <Text className="text-lg font-bold text-gray-900 capitalize">
                {product.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Quantity Editor */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <View className="bg-white rounded-2xl p-5 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">
                Update Quantity
              </Text>
              {!isEditing && (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  className="p-2"
                >
                  <Ionicons name="pencil" size={18} color={categoryColor} />
                </TouchableOpacity>
              )}
            </View>

            {isEditing ? (
              <>
                <View className="flex-row items-center gap-3 mb-4">
                  <TouchableOpacity
                    onPress={() => {
                      const q = parseInt(quantity, 10) || 0;
                      if (q > 0) setQuantity((q - 1).toString());
                    }}
                    className="w-12 h-12 rounded-lg bg-gray-100 justify-center items-center active:bg-gray-200"
                  >
                    <Ionicons name="remove" size={24} color="#6b7280" />
                  </TouchableOpacity>

                  <TextInput
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    className="flex-1 text-center text-2xl font-bold text-gray-900 bg-gray-50 rounded-lg py-3"
                  />

                  <TouchableOpacity
                    onPress={() => {
                      const q = parseInt(quantity, 10) || 0;
                      setQuantity((q + 1).toString());
                    }}
                    className="w-12 h-12 rounded-lg bg-gray-100 justify-center items-center active:bg-gray-200"
                  >
                    <Ionicons name="add" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => {
                      setIsEditing(false);
                      setQuantity(product.quantity.toString());
                    }}
                    className="flex-1 py-3 rounded-lg bg-gray-100 active:bg-gray-200"
                  >
                    <Text className="text-center font-semibold text-gray-700">
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleUpdate}
                    disabled={updateProductMutation.isPending}
                    className="flex-1 py-3 rounded-lg justify-center items-center"
                    style={{ backgroundColor: categoryColor }}
                  >
                    {updateProductMutation.isPending ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-center font-semibold text-white">
                        Save
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text className="text-lg text-gray-600">
                Current quantity: <Text className="font-bold text-gray-900">{quantity} {product.unit}</Text>
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Additional Info */}
        {(product.openedAt || product.categories) && (
          <Animated.View entering={FadeInUp.delay(400).duration(400)} className="bg-white rounded-2xl p-5 mb-6">
            {product.openedAt && (
              <View className="mb-4 pb-4 border-b border-gray-100">
                <Text className="text-xs text-gray-600 font-medium mb-2">
                  OPENED
                </Text>
                <Text className="text-gray-900 font-medium">
                  {new Date(product.openedAt).toLocaleDateString("fr-FR")}
                </Text>
              </View>
            )}
            {product.categories && product.categories.length > 0 && (
              <View>
                <Text className="text-xs text-gray-600 font-medium mb-2">
                  TAGS
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {product.categories.slice(0, 3).map((cat, idx) => (
                    <View
                      key={idx}
                      className="px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: categoryBgColor }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: categoryColor }}
                      >
                        {cat}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        )}
      </Animated.View>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {headerComponent}
      <ScrollView showsVerticalScrollIndicator={false}>
        {scrollContent}
      </ScrollView>
    </SafeAreaView>
  );
}
