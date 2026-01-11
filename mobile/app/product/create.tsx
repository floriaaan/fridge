import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProductCreateScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { barcode, name, brand } = useMemo(() => ({
    barcode: typeof params.barcode === "string" ? params.barcode : Array.isArray(params.barcode) ? params.barcode[0] : "",
    name: typeof params.name === "string" ? params.name : Array.isArray(params.name) ? params.name[0] : "",
    brand: typeof params.brand === "string" ? params.brand : Array.isArray(params.brand) ? params.brand[0] : "",
  }), [params]);

  console.log("Open create modal with:", { barcode, name, brand });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>Nouveau produit</Text>
      <Text style={styles.label}>Code barre</Text>
      <Text style={styles.value}>{barcode || "-"}</Text>

      <Text style={styles.label}>Nom détecté</Text>
      <Text style={styles.value}>{name || "(non trouvé)"}</Text>

      {brand ? (
        <>
          <Text style={styles.label}>Marque</Text>
          <Text style={styles.value}>{brand}</Text>
        </>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryText}>Valider plus tard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  label: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "black",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    borderColor: "#d1d5db",
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "white",
  },
  secondaryText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
});
