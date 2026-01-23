import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  useColorScheme,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { searchOpenFoodFacts, OpenFoodFactsProduct } from "@/lib/api/openfoodfacts";
import { useTranslation } from "@/hooks/use-translation";

interface ProductSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (product: OpenFoodFactsProduct) => void;
  currentProductName?: string;
}

export function ProductSearchModal({
  visible,
  onClose,
  onSelect,
  currentProductName = "",
}: ProductSearchModalProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [searchQuery, setSearchQuery] = useState(currentProductName);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<OpenFoodFactsProduct[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchOpenFoodFacts(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectProduct = (product: OpenFoodFactsProduct) => {
    onSelect(product);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 bg-neutral-50 dark:bg-black"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="bg-white dark:bg-neutral-800 p-4 border-b border-neutral-200 dark:border-neutral-700">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {t("product.searchTitle")}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-lg text-neutral-600 dark:text-neutral-400">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-2">
            <TextInput
              className="flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl px-4 py-3 text-neutral-900 dark:text-neutral-100"
              placeholder={t("product.searchPlaceholder")}
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              className={`px-4 py-3 rounded-xl ${isSearching ? "bg-neutral-400" : "bg-neutral-900 dark:bg-neutral-100"}`}
              onPress={handleSearch}
              disabled={isSearching}
            >
              <Text className={`font-semibold ${isSearching ? "text-white" : "text-white dark:text-neutral-900"}`}>
                {isSearching ? "..." : "🔍"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {isSearching && (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color={isDark ? "#fafafa" : "#111827"} />
              <Text className="mt-4 text-neutral-600 dark:text-neutral-400">
                {t("product.searching")}
              </Text>
            </View>
          )}

          {!isSearching && hasSearched && searchResults.length === 0 && (
            <View className="items-center py-8">
              <Text className="text-4xl mb-4">🔍</Text>
              <Text className="text-lg text-neutral-900 dark:text-neutral-100 font-semibold mb-2">
                {t("product.noResults")}
              </Text>
              <Text className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                {t("product.noResultsDescription")}
              </Text>
            </View>
          )}

          {!isSearching && !hasSearched && (
            <View className="items-center py-8">
              <Text className="text-4xl mb-4">🍎</Text>
              <Text className="text-lg text-neutral-900 dark:text-neutral-100 font-semibold mb-2">
                {t("product.searchInstructions")}
              </Text>
              <Text className="text-sm text-neutral-600 dark:text-neutral-400 text-center px-8">
                {t("product.searchInstructionsDescription")}
              </Text>
            </View>
          )}

          {!isSearching && searchResults.length > 0 && (
            <View>
              <Text className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                {searchResults.length} {t("product.resultsFound")}
              </Text>
              {searchResults.map((product, index) => (
                <TouchableOpacity
                  key={`${product.code}-${index}`}
                  className="mb-3 bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700"
                  onPress={() => handleSelectProduct(product)}
                >
                  <View className="flex-row items-center">
                    {product.image_url && (
                      <Image
                        source={{ uri: product.image_url }}
                        className="w-16 h-16 rounded-lg mr-3"
                        resizeMode="cover"
                      />
                    )}
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                        {product.product_name || product.product_name_fr || product.code}
                      </Text>
                      {product.categories && (
                        <Text className="text-xs text-neutral-500 dark:text-neutral-400" numberOfLines={1}>
                          {product.categories.split(",")[0]}
                        </Text>
                      )}
                    </View>
                    <Text className="text-neutral-400 dark:text-neutral-600 ml-2">→</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
