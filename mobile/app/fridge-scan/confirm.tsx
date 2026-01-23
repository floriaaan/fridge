import React, { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  scanFridgeContents,
  importFridgeProducts,
  type ImportFridgeItem,
} from "@/lib/api/fridge-scan";
import type { EnhancedProduct } from "@/lib/api/receipt";
import Snackbar, { SnackbarRef } from "@/components/ui/snackbar";
import { ConfirmationScreen } from "@/components/confirmation-screen";
import { useTranslation } from "@/hooks/use-translation";

interface EditableProduct extends EnhancedProduct {
  id: string;
  included: boolean;
  location: string;
}

export default function FridgeScanConfirmScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const snackBarRef = useRef<SnackbarRef>(null);
  const { t } = useTranslation();

  const [isScanning, setIsScanning] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [products, setProducts] = useState<EditableProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performScan = async () => {
      try {
        const imageBase64 = params.imageBase64 as string;
        if (!imageBase64) {
          throw new Error(t("common.error"));
        }

        const result = await scanFridgeContents(imageBase64);

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
            : t("common.error")
        );
      } finally {
        setIsScanning(false);
      }
    };

    performScan();
  }, [params.imageBase64, t]);

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

  const updateProduct = (id: string, updates: Partial<EditableProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handleImport = async () => {
    const includedProducts = products.filter((p) => p.included);

    if (includedProducts.length === 0) {
      Alert.alert(t("common.error"), t("fridgeScan.selectProducts"));
      return;
    }

    setIsImporting(true);
    try {
      const importItems: ImportFridgeItem[] = includedProducts.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        unit: p.unit,
        category: p.category,
        location: p.location,
        openfoodfactId: p.openfoodfactId,
        estimatedExpiryDays: p.estimatedExpiryDays,
      }));

      await importFridgeProducts({ items: importItems });

      snackBarRef.current?.show(
        `${includedProducts.length} ${t("common.success")}`,
        3000
      );

      setTimeout(() => {
        router.dismissTo("/(tabs)");
      }, 1000);
    } catch (err) {
      console.error("Import error:", err);
      Alert.alert(t("common.error"), t("common.error"));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <ConfirmationScreen
      isScanning={isScanning}
      isImporting={isImporting}
      error={error}
      products={products}
      headerInfo={{
        title: t("fridgeScan.title"),
        subtitle: `${products.length} ${t("fridgeScan.selectProducts")}`,
      }}
      onToggleProduct={toggleProductInclusion}
      onUpdateLocation={updateProductLocation}
      onUpdateProduct={updateProduct}
      onImport={handleImport}
      onCancel={() => router.back()}
      importButtonText={t("receipt.import")}
      accentColor="#06B6D4"
    />
  );
}
