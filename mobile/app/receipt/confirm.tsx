import React, { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  scanReceipt,
  importReceipt,
  type EnhancedProduct,
  type ImportReceiptItem,
} from "@/lib/api/receipt";
import Snackbar, { SnackbarRef } from "@/components/ui/snackbar";
import { ConfirmationScreen } from "@/components/confirmation-screen";
import { useTranslation } from "@/hooks/use-translation";

interface EditableProduct extends EnhancedProduct {
  id: string;
  included: boolean;
  location: string;
}

export default function ReceiptConfirmScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const snackBarRef = useRef<SnackbarRef>(null);
  const { t } = useTranslation();

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

  const updateProduct = (id: string, updates: Partial<EditableProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
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

  return (
    <ConfirmationScreen
      isScanning={isScanning}
      isImporting={isImporting}
      error={error}
      products={products}
      headerInfo={{
        title: storeName,
        subtitle: `${new Date(date).toLocaleDateString("fr-FR")} • ${products.length} ${t("receipt.selectProducts")}`,
        amount: `Total : ${totalAmount.toFixed(2)}€`,
      }}
      onToggleProduct={toggleProductInclusion}
      onUpdateLocation={updateProductLocation}
      onUpdateProduct={updateProduct}
      onImport={handleImport}
      onCancel={() => router.back()}
      importButtonText={t("receipt.import")}
      accentColor="#22c55e"
    />
  );
}
