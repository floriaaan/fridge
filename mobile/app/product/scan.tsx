import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CameraView,
  type BarcodeScanningResult,
  useCameraPermissions,
} from "expo-camera";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { fetchOpenFoodFactProductByBarcode } from "@/api/fetch-products";

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [requesting, setRequesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const lockRef = useRef(false); // immediate guard against rapid multi-fire

  useEffect(() => {
    if (isFocused) {
      setLastBarcode(null);
      setStatusMessage(null);
      setIsFetching(false);
      setLocked(false);
      lockRef.current = false;
    }
  }, [isFocused]);

  useEffect(() => {
    if (!permission) {
      setRequesting(true);
      requestPermission().finally(() => setRequesting(false));
    }
  }, [permission, requestPermission]);

  const handleRequestPermission = async () => {
    setRequesting(true);
    await requestPermission();
    setRequesting(false);
  };

  const cameraActive = useMemo(
    () => permission?.granted && isFocused && !requesting && !locked,
    [permission?.granted, isFocused, requesting, locked]
  );

  const handleBarcodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      const value = result.data?.trim();
      if (!value) return;
      // Prevent rapid double scans on same code
      if (lockRef.current || locked || isFetching || value === lastBarcode)
        return;

      setIsFetching(true);
      setLocked(true);
      lockRef.current = true;
      setLastBarcode(value);
      setStatusMessage("Scanning...");

      try {
        const product = await fetchOpenFoodFactProductByBarcode(value);
        const productName =
          product?.product_name_fr || product?.product_name || "(no name)";

        console.log("Scanned barcode:", value);
        console.log("OpenFoodFacts product name:", productName);

        setStatusMessage(
          productName ? `Found: ${productName}` : "Product found (no name)"
        );

        router.push({
          pathname: "/product/create",
          params: {
            product: JSON.stringify(product),
          },
        });
      } catch (error) {
        console.log("Failed to fetch OpenFoodFacts product", error);
        setStatusMessage("Not found or network error");
        // Allow new scan after a short delay to avoid tight loop
        setTimeout(() => {
          setLastBarcode(null);
          setLocked(false);
          lockRef.current = false;
        }, 1200);
      } finally {
        setIsFetching(false);
      }
    },
    [isFetching, lastBarcode, locked, router]
  );

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.infoText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Camera access needed</Text>
        <Text style={styles.infoText}>
          We need your permission to scan barcodes.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRequestPermission}
          disabled={requesting}
        >
          {requesting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Allow camera</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cameraActive && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "qr"],
          }}
          // Disable handler entirely when locked to avoid late events
          onBarcodeScanned={locked ? undefined : handleBarcodeScanned}
        />
      )}

      <View style={[styles.overlay, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>Scan a barcode</Text>
        <Text style={styles.infoText}>Center the barcode in the frame.</Text>
      </View>

      <View style={styles.frame}>
        <View style={styles.cornerTopLeft} />
        <View style={styles.cornerTopRight} />
        <View style={styles.cornerBottomLeft} />
        <View style={styles.cornerBottomRight} />
      </View>

      {statusMessage && (
        <View style={styles.statusBubble}>
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const frameSize = 260;
const cornerSize = 26;
const cornerThickness = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
    backgroundColor: "black",
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
  infoText: {
    color: "#e5e7eb",
    fontSize: 16,
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 6,
  },
  frame: {
    width: frameSize,
    height: frameSize,
    position: "absolute",
    top: "40%",
    left: "50%",
    marginLeft: -frameSize / 2,
    marginTop: -frameSize / 2,
  },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: cornerSize,
    height: cornerSize,
    borderTopWidth: cornerThickness,
    borderLeftWidth: cornerThickness,
    borderColor: "#22c55e",
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: cornerSize,
    height: cornerSize,
    borderTopWidth: cornerThickness,
    borderRightWidth: cornerThickness,
    borderColor: "#22c55e",
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: cornerSize,
    height: cornerSize,
    borderBottomWidth: cornerThickness,
    borderLeftWidth: cornerThickness,
    borderColor: "#22c55e",
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: cornerSize,
    height: cornerSize,
    borderBottomWidth: cornerThickness,
    borderRightWidth: cornerThickness,
    borderColor: "#22c55e",
  },
  statusBubble: {
    position: "absolute",
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  statusText: {
    color: "white",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 15,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    width: "70%",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4b5563",
    width: "60%",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
