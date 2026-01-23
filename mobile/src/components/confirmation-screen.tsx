import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Snackbar, { SnackbarRef } from "@/components/ui/snackbar";
import { ProductSearchModal } from "@/components/product-search-modal";
import { useTranslation } from "@/hooks/use-translation";
import type { EnhancedProduct } from "@/lib/api/receipt";
import type { OpenFoodFactsProduct } from "@/lib/api/openfoodfacts";

interface EditableProduct extends EnhancedProduct {
  id: string;
  included: boolean;
  location: string;
}

interface ConfirmationScreenProps {
  isScanning: boolean;
  isImporting: boolean;
  error: string | null;
  products: EditableProduct[];
  headerInfo?: {
    title: string;
    subtitle?: string;
    amount?: string;
  };
  onToggleProduct: (id: string) => void;
  onUpdateLocation: (id: string, location: string) => void;
  onUpdateProduct: (id: string, updates: Partial<EditableProduct>) => void;
  onImport: () => Promise<void>;
  onCancel: () => void;
  importButtonText: string;
  accentColor?: string;
}

export function ConfirmationScreen({
  isScanning,
  isImporting,
  error,
  products,
  headerInfo,
  onToggleProduct,
  onUpdateLocation,
  onUpdateProduct,
  onImport,
  onCancel,
  importButtonText,
  accentColor = "#22c55e",
}: ConfirmationScreenProps) {
  const insets = useSafeAreaInsets();
  const snackBarRef = useRef<SnackbarRef>(null);
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [editingProductName, setEditingProductName] = useState("");

  const handleEditProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setEditingProductId(productId);
      setEditingProductName(product.name);
    }
  };

  const handleSaveProductName = (productId: string) => {
    if (editingProductName.trim()) {
      onUpdateProduct(productId, { name: editingProductName.trim() });
    }
    setEditingProductId(null);
  };

  const handleSearchProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setEditingProductId(productId);
      setEditingProductName(product.name);
      setSearchModalVisible(true);
    }
  };

  const handleSelectFromSearch = (product: OpenFoodFactsProduct) => {
    if (editingProductId) {
      onUpdateProduct(editingProductId, {
        name: product.product_name || product.product_name_fr || product.code,
        openfoodfactId: product.code,
        imageUrl: product.image_url,
        confidence: "high" as const,
      });
      setEditingProductId(null);
    }
  };

  if (isScanning) {
    return (
      <View className="flex-1 bg-neutral-50 dark:bg-black justify-center items-center p-6">
        <ActivityIndicator size="large" color={isDark ? "#fafafa" : "#111827"} />
        <Text className="mt-4 text-lg text-neutral-700 dark:text-neutral-300 font-semibold">
          {t("receipt.analyzing")}
        </Text>
        <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 text-center">
          {t("receipt.analyzeDescription")}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="flex-1 bg-neutral-50 dark:bg-black justify-center items-center p-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-6xl mb-4">⚠️</Text>
        <Text className="text-lg text-neutral-900 dark:text-neutral-100 font-semibold mb-2">
          {t("common.error")}
        </Text>
        <Text className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-6">
          {error}
        </Text>
        <TouchableOpacity
          className="bg-neutral-900 dark:bg-neutral-100 py-3 px-6 rounded-xl"
          onPress={onCancel}
        >
          <Text className="text-white dark:text-neutral-900 font-semibold">
            {t("common.retry")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-neutral-50 dark:bg-black"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {headerInfo && (
        <View className="bg-white dark:bg-neutral-800 p-4 border-b border-neutral-200 dark:border-neutral-700">
          <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {headerInfo.title}
          </Text>
          {headerInfo.subtitle && (
            <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {headerInfo.subtitle}
            </Text>
          )}
          {headerInfo.amount && (
            <Text className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mt-2">
              {headerInfo.amount}
            </Text>
          )}
        </View>
      )}

      <ScrollView className="flex-1 px-4 py-4">
        {products.map((product) => (
          <View
            key={product.id}
            className={`mb-3 bg-white dark:bg-neutral-800 rounded-xl p-4 border`}
            style={{
              borderColor: product.included
                ? accentColor
                : isDark
                  ? "#4B5563"
                  : "#D1D5DB",
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1 flex-row items-center">
                <TouchableOpacity
                  onPress={() => onToggleProduct(product.id)}
                  className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center`}
                  style={{
                    backgroundColor: product.included ? accentColor : "transparent",
                    borderColor: product.included
                      ? accentColor
                      : isDark
                        ? "#6B7280"
                        : "#9CA3AF",
                  }}
                >
                  {product.included && (
                    <Text className="text-white font-bold">✓</Text>
                  )}
                </TouchableOpacity>
                <View className="flex-1">
                  {editingProductId === product.id ? (
                    <View className="flex-row gap-2">
                      <TextInput
                        className="flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100"
                        value={editingProductName}
                        onChangeText={setEditingProductName}
                        onBlur={() => handleSaveProductName(product.id)}
                        onSubmitEditing={() => handleSaveProductName(product.id)}
                        autoFocus
                      />
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleEditProduct(product.id)}
                      onLongPress={() => handleEditProduct(product.id)}
                    >
                      <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {product.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                    {product.quantity} {product.unit}
                    {product.price > 0 && ` • ${product.price.toFixed(2)}€`}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                {product.confidence === "low" && (
                  <View className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">
                    <Text className="text-xs text-yellow-800 dark:text-yellow-200">
                      ⚠️
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => handleSearchProduct(product.id)}
                  className="p-1"
                >
                  <Text className="text-neutral-600 dark:text-neutral-400">🔍</Text>
                </TouchableOpacity>
              </View>
            </View>

            {product.included && (
              <View className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <Text className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                  {t("product.location")}
                </Text>
                <View className="flex-row gap-2">
                  {[
                    { key: "frigo", label: t("product.locationFridge") },
                    { key: "congélateur", label: t("product.locationFreezer") },
                    { key: "garde-manger", label: t("product.locationPantry") },
                  ].map(({ key, label }) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => onUpdateLocation(product.id, key)}
                      className={`px-3 py-1.5 rounded-lg ${
                        product.location === key
                          ? "bg-neutral-900 dark:bg-neutral-100"
                          : "bg-neutral-200 dark:bg-neutral-700"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          product.location === key
                            ? "text-white dark:text-neutral-900 font-semibold"
                            : "text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {product.estimatedExpiryDays && (
                  <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    ~{product.estimatedExpiryDays}{" "}
                    {t("fridge.daysLeft", { count: product.estimatedExpiryDays })}
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View className="bg-white dark:bg-neutral-800 p-4 border-t border-neutral-200 dark:border-neutral-700 flex-row gap-3">
        <TouchableOpacity
          className="flex-1 border border-neutral-300 dark:border-neutral-600 py-4 rounded-xl items-center bg-white dark:bg-neutral-800"
          onPress={onCancel}
          disabled={isImporting}
        >
          <Text className="text-neutral-900 dark:text-neutral-100 font-semibold">
            {t("common.cancel")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-4 rounded-xl items-center`}
          style={{
            backgroundColor: isImporting
              ? isDark
                ? "#4B5563"
                : "#9CA3AF"
              : accentColor,
          }}
          onPress={onImport}
          disabled={isImporting}
        >
          <Text className="text-white font-semibold">
            {isImporting
              ? t("common.loading")
              : `${importButtonText} (${products.filter((p) => p.included).length})`}
          </Text>
        </TouchableOpacity>
      </View>

      <ProductSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelect={handleSelectFromSearch}
        currentProductName={editingProductName}
      />

      <Snackbar ref={snackBarRef} />
    </View>
  );
}
