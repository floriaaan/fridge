import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { type Product } from "@/lib/api/fetch-products";
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
  >("expiring");
  const [searchQuery, setSearchQuery] = useState("");

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      vegetables: "#E8F5E9",
      dairy: "#E3F2FD",
      meat: "#FBE9E7",
      poultry: "#EFEBE9",
      fruits: "#FFF3E0",
      beverages: "#E1F5FE",
      snacks: "#FFFDE7",
      condiments: "#EFEBE9",
      bread: "#FFEAA7",
      pantry: "#F3E5F5",
    };
    return colors[category.toLowerCase()] || "#F5F5F5";
  };

  const getCategoryTextColor = (category: string): string => {
    const colors: Record<string, string> = {
      vegetables: "#2E7D32",
      dairy: "#1565C0",
      meat: "#BF360C",
      poultry: "#4E342E",
      fruits: "#EF6C00",
      beverages: "#0277BD",
      snacks: "#F9A825",
      condiments: "#4E342E",
      bread: "#E65100",
      pantry: "#6A1B9A",
    };
    return colors[category.toLowerCase()] || "#424242";
  };

  const getCategoryIcon = (
    category: string
  ): keyof typeof MaterialCommunityIcons.glyphMap => {
    const icons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> =
      {
        vegetables: "carrot",
        dairy: "cheese",
        meat: "food-steak",
        poultry: "food-turkey",
        fruits: "food-apple",
        beverages: "cup",
        snacks: "cookie",
        condiments: "bottle-tonic",
        bread: "bread-slice",
        pantry: "warehouse",
      };
    return icons[category.toLowerCase()] || "cube";
  };

  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const sortedProducts = useMemo(
    () =>
      products.sort((a, b) => {
        if (activeFilter === "expiring") {
          const dateA = a.expiresAt
            ? new Date(a.expiresAt).getTime()
            : Infinity;
          const dateB = b.expiresAt
            ? new Date(b.expiresAt).getTime()
            : Infinity;
          return dateA - dateB;
        } else if (activeFilter === "asc") {
          return a.name.localeCompare(b.name);
        } else if (activeFilter === "category") {
          return a.category.localeCompare(b.category);
        }
        return 0;
      }),
    [products, activeFilter]
  );

  const filteredProducts = useMemo(
    () =>
      sortedProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      ),
    [sortedProducts, searchQuery]
  );

  const groupedProducts = useMemo(() => {
    if (activeFilter === "expiring") {
      const groups: { [key: string]: Product[] } = {};
      filteredProducts.forEach((product) => {
        const dateKey = formatDate(product.expiresAt);
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(product);
      });
      return groups;
    } else if (activeFilter === "category") {
      const groups: { [key: string]: Product[] } = {};
      filteredProducts.forEach((product) => {
        const categoryKey = product.category;
        if (!groups[categoryKey]) {
          groups[categoryKey] = [];
        }
        groups[categoryKey].push(product);
      });
      return groups;
    }
    return null;
  }, [filteredProducts, activeFilter]);

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: `/product/[id]`,
      params: { id: product.id, product: JSON.stringify(product) },
    });
  };

  const handleAddProduct = () => {
    router.push("/product/scan");
  };

  const handleScanReceipt = () => {
    router.push("/receipt/scan");
  };

  const handleGenerateRecipe = () => {
    router.push("/recipe/generate");
  };

  function formatDate(date: string | null): string {
    if (!date) return "No expiry date";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function isDateExpired(date: string | null): boolean {
    if (!date) return false;
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }

  function getExpiryStatus(
    date: string | null
  ): { status: "expired" | "expiring_soon" | null; icon: string } {
    if (!date) return { status: null, icon: "" };

    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    if (d < today) {
      return { status: "expired", icon: "alert-circle" };
    }

    const daysUntilExpiry = Math.ceil(
      (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry <= 7) {
      return { status: "expiring_soon", icon: "time" };
    }

    return { status: null, icon: "" };
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView
        horizontal
        className="flex-grow-0"
        contentContainerClassName="flex items-center gap-1 flex flex-row mb-4 px-4 h-12"
        showsHorizontalScrollIndicator={false}
      >
        <GradientChip
          label="AI Recipe"
          onPress={handleGenerateRecipe}
          icon={<Ionicons name="sparkles" size={16} />}
        />
        <View className="w-px h-6 bg-gray-300 mx-1" />
        <Chip
          label="Expiring soon"
          isActive={activeFilter === "expiring"}
          onPress={() => setActiveFilter("expiring")}
          icon={
            <Ionicons
              name="time"
              size={16}
              color={activeFilter === "expiring" ? "white" : "#6B7280"}
            />
          }
        />
        <Chip
          label="Alphabetical"
          isActive={activeFilter === "asc"}
          onPress={() => setActiveFilter("asc")}
          icon={
            <Ionicons
              name="text"
              size={16}
              color={activeFilter === "asc" ? "white" : "#6B7280"}
            />
          }
        />
        <Chip
          label="Category"
          isActive={activeFilter === "category"}
          onPress={() => setActiveFilter("category")}
          icon={
            <Ionicons
              name="grid-outline"
              size={16}
              color={activeFilter === "category" ? "white" : "#6B7280"}
            />
          }
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
            groupedProducts ? (
              Object.entries(groupedProducts).map(([groupKey, products]) => {
                const expiryStatus =
                  activeFilter === "expiring"
                    ? getExpiryStatus(products[0]?.expiresAt ?? null)
                    : { status: null, icon: "" };

                const categoryColor =
                  activeFilter === "category"
                    ? getCategoryColor(groupKey)
                    : null;
                const categoryTextColor =
                  activeFilter === "category"
                    ? getCategoryTextColor(groupKey)
                    : null;
                const categoryIcon =
                  activeFilter === "category" ? getCategoryIcon(groupKey) : null;

                return (
                  <View key={groupKey}>
                    <View className="flex-row items-center gap-3 mb-3">
                      <View className="flex-1 h-px bg-gray-300" />
                      <View className="flex-row items-center gap-2">
                        {activeFilter === "category" && categoryIcon && (
                          <View
                            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: categoryColor || "#F5F5F5" }}
                          >
                            <MaterialCommunityIcons
                              name={categoryIcon}
                              size={14}
                              color={categoryTextColor || "#424242"}
                            />
                            <Text
                              className="text-sm font-semibold"
                              style={{
                                color: categoryTextColor || "#424242",
                              }}
                            >
                              {capitalize(groupKey)}
                            </Text>
                          </View>
                        )}
                        {activeFilter !== "category" && (
                          <Text className="text-gray-600 text-sm font-medium">
                            {groupKey}
                          </Text>
                        )}
                        {expiryStatus.status && (
                          <View
                            className={`flex-row items-center gap-1 px-2 py-1 rounded-full ${
                              expiryStatus.status === "expired"
                                ? "bg-red-100"
                                : "bg-orange-100"
                            }`}
                          >
                            <Ionicons
                              name={
                                expiryStatus.icon as
                                  | "alert-circle"
                                  | "time"
                              }
                              size={12}
                              color={
                                expiryStatus.status === "expired"
                                  ? "#DC2626"
                                  : "#EA580C"
                              }
                            />
                            <Text
                              className={`text-xs font-semibold ${
                                expiryStatus.status === "expired"
                                  ? "text-red-700"
                                  : "text-orange-700"
                              }`}
                            >
                              {expiryStatus.status === "expired"
                                ? "Expired"
                                : "Expiring soon"}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View className="flex-1 h-px bg-gray-300" />
                    </View>
                    <View className="gap-4">
                      {products.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onPress={() => handleProductPress(product)}
                          index={index}
                        />
                      ))}
                    </View>
                  </View>
                );
              })
            ) : (
              filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product)}
                  index={index}
                />
              ))
            )
          ) : (
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-gray-500 text-lg">No products found.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-5 left-5 right-5">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleScanReceipt}
            className="flex-1 bg-green-600 py-4 rounded-xl shadow-xl flex flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Ionicons
              name="document-text-outline"
              size={24}
              color="white"
              className="mr-2"
            />
            <Text className="text-white font-semibold text-base">
              Scan ticket
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAddProduct}
            className="flex-1 bg-black py-4 rounded-xl shadow-xl flex flex-row items-center justify-center"
            activeOpacity={0.8}
            testID="add-product-button"
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color="white"
              className="mr-2"
            />
            <Text className="text-white font-semibold text-base">
              Add product
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
