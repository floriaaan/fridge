import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  TextInput,
  useColorScheme,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { type Product } from "@/lib/api/fetch-products";
import { ProductCard } from "@/components/product-card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/empty-state";
import { GradientChip } from "@/components/ui/gradient-chip";
import { AnimatedTouchableOpacity } from "@/components/ui/animated-touchable-opacity";
import { useTranslation } from "@/hooks/use-translation";
import { useMarkProductOpened, useMarkProductConsumed } from "@/hooks/use-products";
import { BottomFloatingContainer } from "@/components/ui/bottom-floating-container";

type FridgeListProps = {
  products: Product[];
  refresh: () => void;
  isLoading: boolean;
};

export function FridgeList({ products, refresh, isLoading }: FridgeListProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeFilter, setActiveFilter] = useState<
    "expiring" | "asc" | "category"
  >("expiring");
  const [searchQuery, setSearchQuery] = useState("");

  const { mutate: markOpened } = useMarkProductOpened();
  const { mutate: markConsumed } = useMarkProductConsumed();

  const handleMarkOpened = (productId: string) => {
    markOpened(productId, {
      onSuccess: () => refresh(),
    });
  };

  const handleDelete = (productId: string) => {
    markConsumed(productId, {
      onSuccess: () => refresh(),
    });
  };

  const inactiveIconColor = isDark ? "#a3a3a3" : "#737373";
  const activeIconColor = isDark ? "#171717" : "#ffffff";

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      vegetables: isDark ? "#064e3b" : "#E8F5E9",
      dairy: isDark ? "#1e3a5f" : "#E3F2FD",
      meat: isDark ? "#7c2d12" : "#FBE9E7",
      poultry: isDark ? "#44403c" : "#EFEBE9",
      fruits: isDark ? "#78350f" : "#FFF3E0",
      beverages: isDark ? "#0c4a6e" : "#E1F5FE",
      snacks: isDark ? "#713f12" : "#FFFDE7",
      condiments: isDark ? "#44403c" : "#EFEBE9",
      bread: isDark ? "#78350f" : "#FFEAA7",
      pantry: isDark ? "#581c87" : "#F3E5F5",
    };
    return colors[category.toLowerCase()] || (isDark ? "#262626" : "#F5F5F5");
  };

  const getCategoryTextColor = (category: string): string => {
    const colors: Record<string, string> = {
      vegetables: isDark ? "#6ee7b7" : "#2E7D32",
      dairy: isDark ? "#93c5fd" : "#1565C0",
      meat: isDark ? "#fdba74" : "#BF360C",
      poultry: isDark ? "#d6d3d1" : "#4E342E",
      fruits: isDark ? "#fbbf24" : "#EF6C00",
      beverages: isDark ? "#7dd3fc" : "#0277BD",
      snacks: isDark ? "#fcd34d" : "#F9A825",
      condiments: isDark ? "#d6d3d1" : "#4E342E",
      bread: isDark ? "#fbbf24" : "#E65100",
      pantry: isDark ? "#d8b4fe" : "#6A1B9A",
    };
    return colors[category.toLowerCase()] || (isDark ? "#e5e5e5" : "#424242");
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
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleAnalyzeFridge = () => {
    router.push("/fridge-scan/scan");
  };

  function formatDate(date: string | null): string {
    if (!date) return t("common.noExpiryDate");
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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
          label={t("fridge.aiRecipe")}
          onPress={handleGenerateRecipe}
          icon={<Ionicons name="sparkles" size={16} />}
        />
        <View className="w-px h-6 bg-neutral-300 dark:bg-neutral-700 mx-1" />
        <Chip
          label={t("fridge.expiringSoon")}
          isActive={activeFilter === "expiring"}
          onPress={() => setActiveFilter("expiring")}
          icon={
            <Ionicons
              name="time"
              size={16}
              color={activeFilter === "expiring" ? activeIconColor : inactiveIconColor}
            />
          }
        />
        <Chip
          label={t("fridge.alphabetical")}
          isActive={activeFilter === "asc"}
          onPress={() => setActiveFilter("asc")}
          icon={
            <Ionicons
              name="text"
              size={16}
              color={activeFilter === "asc" ? activeIconColor : inactiveIconColor}
            />
          }
        />
        <Chip
          label={t("fridge.category")}
          isActive={activeFilter === "category"}
          onPress={() => setActiveFilter("category")}
          icon={
            <Ionicons
              name="grid-outline"
              size={16}
              color={activeFilter === "category" ? activeIconColor : inactiveIconColor}
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
            tintColor={isDark ? "white" : "black"}
          />
        }
      >
        <View className="px-4 mb-4">
          <View className="flex-row items-center bg-neutral-200 dark:bg-neutral-800 rounded-xl px-4 py-3">
            <MaterialIcons name="search" size={20} color={inactiveIconColor} />
            <TextInput
              className="flex-1 ml-3 text-neutral-900 dark:text-neutral-100"
              onChangeText={setSearchQuery}
              value={searchQuery}
              placeholder={t("fridge.searchPlaceholder")}
              placeholderTextColor={isDark ? "#737373" : "#a3a3a3"}
            />
          </View>
        </View>
        <View className="flex flex-col flex-1 px-4 gap-4">
          {filteredProducts.length > 0 ? (
            groupedProducts ? (
              Object.entries(groupedProducts).map(([groupKey, groupProducts]) => {
                const expiryStatus =
                  activeFilter === "expiring"
                    ? getExpiryStatus(groupProducts[0]?.expiresAt ?? null)
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
                  activeFilter === "category"
                    ? getCategoryIcon(groupKey)
                    : null;

                return (
                  <View key={groupKey}>
                    <View className="flex-row items-center gap-3 mb-3">
                      <View className="flex-1 h-px bg-neutral-300 dark:bg-neutral-700" />
                      <View className="flex-row items-center gap-2">
                        {activeFilter === "category" && categoryIcon && (
                          <View
                            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
                            style={{
                              backgroundColor: categoryColor || "#F5F5F5",
                            }}
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
                          <Text className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">
                            {groupKey}
                          </Text>
                        )}
                        {expiryStatus.status && (
                          <View
                            className={`flex-row items-center gap-1 px-2 py-1 rounded-full ${
                              expiryStatus.status === "expired"
                                ? "bg-red-100 dark:bg-red-900/50"
                                : "bg-orange-100 dark:bg-orange-900/50"
                            }`}
                          >
                            <Ionicons
                              name={
                                expiryStatus.icon as "alert-circle" | "time"
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
                                  ? "text-red-700 dark:text-red-400"
                                  : "text-orange-700 dark:text-orange-400"
                              }`}
                            >
                              {expiryStatus.status === "expired"
                                ? t("fridge.expired")
                                : t("fridge.expiringSoon")}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View className="flex-1 h-px bg-neutral-300 dark:bg-neutral-700" />
                    </View>
                    <View className="gap-4">
                      {groupProducts.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onPress={() => handleProductPress(product)}
                          onDelete={handleDelete}
                          onMarkOpened={handleMarkOpened}
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
                  onDelete={handleDelete}
                  onMarkOpened={handleMarkOpened}
                  index={index}
                />
              ))
            )
          ) : (
            <EmptyState
              icon="cube-outline"
              title={t("fridge.noProductsFound")}
              subtitle={
                filteredProducts.length === 0 && products.length > 0
                  ? t("fridge.tryDifferentSearch")
                  : t("fridge.addFirstProduct")
              }
            />
          )}
        </View>
      </ScrollView>

      <BottomFloatingContainer style={{ left: 20, right: 20 }}>
        <View className="flex-row gap-3">
          <AnimatedTouchableOpacity
            onPress={handleScanReceipt}
            className="flex-1 bg-green-600 py-4 px-4 rounded-full shadow-2xl flex flex-row items-center justify-center"
            activeOpacity={1}
          >
            <Ionicons
              name="document-text-outline"
              size={24}
              color="white"
            />
            <Text className="text-white font-semibold text-base ml-2">
              {t("fridge.scanTicket")}
            </Text>
          </AnimatedTouchableOpacity>

          <AnimatedTouchableOpacity
            onPress={handleAnalyzeFridge}
            className="bg-blue-600 px-4 py-4 rounded-full shadow-2xl flex items-center justify-center"
            activeOpacity={1}
            testID="analyze-fridge-button"
          >
            <Ionicons name="eye-outline" size={24} color="white" />
          </AnimatedTouchableOpacity>

          <AnimatedTouchableOpacity
            onPress={handleAddProduct}
            className="bg-neutral-900 dark:bg-neutral-100 px-4 py-4 rounded-full shadow-2xl flex items-center justify-center"
            activeOpacity={1}
            testID="add-product-button"
          >
            <Ionicons
              name="barcode-outline"
              size={24}
              color={isDark ? "black" : "white"}
            />
          </AnimatedTouchableOpacity>
        </View>
      </BottomFloatingContainer>
    </GestureHandlerRootView>
  );
}
