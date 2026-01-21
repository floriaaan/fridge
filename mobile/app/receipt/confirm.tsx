import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  scanReceipt,
  importReceipt,
  type EnhancedProduct,
  type ImportReceiptItem,
} from "@/lib/api/receipt";
import Snackbar, { SnackbarRef } from "@/components/ui/snackbar";
import { useTranslation } from "@/hooks/use-translation";

interface EditableProduct extends EnhancedProduct {
  id: string;
  included: boolean;
  location: string;
}

export default function ReceiptConfirmScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const snackBarRef = useRef<SnackbarRef>(null);
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [isScanning, setIsScanning] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [date, setDate] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [products, setProducts] = useState<EditableProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performScan = async () => {
      try {
        const imageBase64 = params.imageBase64 as string;
        if (!imageBase64) {
          throw new Error("Aucune image fournie");
        }

        const result = await scanReceipt(imageBase64);

        setStoreName(result.storeName);
        setDate(result.date);
        setTotalAmount(result.totalAmount);
        setProducts(
          result.items.map((item, index) => ({
            ...item,
            id: `${index}`,
            included: true,
            location: "frigo",
          }))
        );
      } catch (err) {
        console.error("Scan error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de lire le ticket, vérifiez l'éclairage"
        );
      } finally {
        setIsScanning(false);
      }
    };

    performScan();
  }, [params.imageBase64]);

  const toggleProductInclusion = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, included: !p.included } : p))
    );
  };

  const updateProductLocation = (id: string, location: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, location } : p))
    );
  };

  const handleImport = async () => {
    const includedProducts = products.filter((p) => p.included);

    if (includedProducts.length === 0) {
      Alert.alert("Aucun produit", "Veuillez sélectionner au moins un produit");
      return;
    }

    setIsImporting(true);
    try {
      const importItems: ImportReceiptItem[] = includedProducts.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        unit: p.unit,
        price: p.price,
        category: p.category,
        location: p.location,
        openfoodfactId: p.openfoodfactId,
        estimatedExpiryDays: p.estimatedExpiryDays,
      }));

      await importReceipt({
        storeName,
        totalAmount,
        date,
        items: importItems,
      });

      snackBarRef.current?.show(
        `${includedProducts.length} produits ajoutés au frigo !`,
        3000
      );

      setTimeout(() => {
        router.dismissTo("/(tabs)");
      }, 1000);
    } catch (err) {
      console.error("Import error:", err);
      Alert.alert(
        "Erreur",
        "Impossible d'importer les produits. Veuillez réessayer."
      );
    } finally {
      setIsImporting(false);
    }
  };

  if (isScanning) {
    return (
      <View className="flex-1 bg-neutral-50 dark:bg-neutral-900 justify-center items-center p-6">
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
        className="flex-1 bg-neutral-50 dark:bg-neutral-900 justify-center items-center p-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-6xl mb-4">⚠️</Text>
        <Text className="text-lg text-neutral-900 dark:text-neutral-100 font-semibold mb-2">
          {t("common.error")}
        </Text>
        <Text className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-6">{error}</Text>
        <TouchableOpacity
          className="bg-neutral-900 dark:bg-neutral-100 py-3 px-6 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white dark:text-neutral-900 font-semibold">{t("common.retry")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="bg-white dark:bg-neutral-800 p-4 border-b border-neutral-200 dark:border-neutral-700">
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{storeName}</Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {new Date(date).toLocaleDateString("fr-FR")} • {products.length}{" "}
          {t("receipt.selectProducts")}
        </Text>
        <Text className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mt-2">
          Total : {totalAmount.toFixed(2)}€
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {products.map((product) => (
          <View
            key={product.id}
            className={`mb-3 bg-white dark:bg-neutral-800 rounded-xl p-4 border ${product.included ? "border-green-500" : "border-neutral-300 dark:border-neutral-600"}`}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1 flex-row items-center">
                <TouchableOpacity
                  onPress={() => toggleProductInclusion(product.id)}
                  className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${product.included ? "bg-green-500 border-green-500" : "border-neutral-400 dark:border-neutral-500"}`}
                >
                  {product.included && (
                    <Text className="text-white font-bold">✓</Text>
                  )}
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {product.name}
                  </Text>
                  <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                    {product.quantity} {product.unit} • {product.price.toFixed(2)}€
                  </Text>
                </View>
              </View>
              {product.confidence === "low" && (
                <View className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">
                  <Text className="text-xs text-yellow-800 dark:text-yellow-200">⚠️ Incertain</Text>
                </View>
              )}
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
                      onPress={() => updateProductLocation(product.id, key)}
                      className={`px-3 py-1.5 rounded-lg ${product.location === key ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-200 dark:bg-neutral-700"}`}
                    >
                      <Text
                        className={`text-sm ${product.location === key ? "text-white dark:text-neutral-900 font-semibold" : "text-neutral-700 dark:text-neutral-300"}`}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {product.estimatedExpiryDays && (
                  <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    ~{product.estimatedExpiryDays} {t("fridge.daysLeft", { count: product.estimatedExpiryDays })}
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
          onPress={() => router.back()}
          disabled={isImporting}
        >
          <Text className="text-neutral-900 dark:text-neutral-100 font-semibold">{t("common.cancel")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-4 rounded-xl items-center ${isImporting ? "bg-neutral-400 dark:bg-neutral-600" : "bg-neutral-900 dark:bg-neutral-100"}`}
          onPress={handleImport}
          disabled={isImporting}
        >
          <Text className={`font-semibold ${isImporting ? "text-white" : "text-white dark:text-neutral-900"}`}>
            {isImporting
              ? t("common.loading")
              : `${t("receipt.import")} (${products.filter((p) => p.included).length})`}
          </Text>
        </TouchableOpacity>
      </View>

      <Snackbar ref={snackBarRef} />
    </View>
  );
}
