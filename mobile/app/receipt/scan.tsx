import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Alert,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useTranslation } from "@/hooks/use-translation";

export default function ReceiptScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [requesting, setRequesting] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  const handleRequestPermission = async () => {
    setRequesting(true);
    await requestPermission();
    setRequesting(false);
  };

  const showCaptureFeedback = () => {
    setShowFeedback(true);
    Animated.sequence([
      Animated.timing(feedbackOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: 300,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowFeedback(false);
    });
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      showCaptureFeedback();
      
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      });

      if (photo?.base64) {
        // Use replace for instant navigation
        router.replace({
          pathname: "/receipt/confirm",
          params: {
            imageBase64: photo.base64,
            imageUri: photo.uri,
          },
        });
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert(t("common.error"), t("camera.captureError"));
    } finally {
      // Reset capturing state only if still on this screen
      // If navigation happened, this component will unmount anyway
      setIsCapturing(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(t("common.error"), t("camera.galleryPermissionRequired"));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        // Use replace for instant navigation
        router.replace({
          pathname: "/receipt/confirm",
          params: {
            imageBase64: result.assets[0].base64,
            imageUri: result.assets[0].uri,
          },
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(t("common.error"), t("camera.imageSelectionError"));
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const doc = result.assets[0];
      if (!doc) return;

      // For images, read as base64 using expo-file-system
      if (doc.mimeType?.startsWith('image/')) {
        try {
          const base64Data = await FileSystem.readAsStringAsync(doc.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          // Use replace for instant navigation
          router.replace({
            pathname: "/receipt/confirm",
            params: {
              imageBase64: base64Data,
              imageUri: doc.uri,
            },
          });
        } catch (error) {
          console.error("Error reading image file:", error);
          Alert.alert(t("common.error"), t("camera.documentSelectionError"));
        }
      } else if (doc.mimeType === 'application/pdf') {
        // For PDFs, we need to convert first page to image
        // For now, show an alert that PDF support requires additional setup
        Alert.alert(
          t("common.error"),
          t("camera.pdfNotSupported")
        );
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert(t("common.error"), t("camera.documentSelectionError"));
    }
  };

  const showImageSourcePicker = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t("common.cancel"),
            t("camera.takePhoto"),
            t("camera.chooseFromGallery"),
            t("camera.chooseFile")
          ],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handlePickImage();
          } else if (buttonIndex === 3) {
            handlePickDocument();
          }
        }
      );
    } else {
      // Android: Show custom alert with options
      Alert.alert(
        t("camera.selectSource"),
        "",
        [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("camera.takePhoto"), onPress: handleTakePhoto },
          { text: t("camera.chooseFromGallery"), onPress: handlePickImage },
          { text: t("camera.chooseFile"), onPress: handlePickDocument },
        ]
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.infoText}>{t("camera.checkingPermission")}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>{t("camera.accessNeeded")}</Text>
        <Text style={styles.infoText}>
          {t("receipt.scanTicket")}
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRequestPermission}
          disabled={requesting}
        >
          {requesting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{t("camera.allowCamera")}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>{t("common.cancel")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      {showFeedback && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "white",
              opacity: feedbackOpacity,
            },
          ]}
        />
      )}

      <View style={[styles.overlay, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>{t("receipt.scanTicket")}</Text>
        <Text style={styles.infoText}>
          {t("receipt.placeReceipt")}
        </Text>
      </View>

      <View style={styles.frame}>
        <View style={styles.corner} />
        <View style={[styles.corner, styles.cornerTopRight]} />
        <View style={[styles.corner, styles.cornerBottomLeft]} />
        <View style={[styles.corner, styles.cornerBottomRight]} />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>{t("receipt.tip")}</Text>
          <Text style={styles.tipSubText}>
            • {t("receipt.tipAvoidReflections")}{"\n"}• {t("receipt.tipEnsureReadable")}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
          onPress={handleTakePhoto}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>

        <View style={styles.bottomButtonRow}>
          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={showImageSourcePicker}
            disabled={isCapturing}
          >
            <Text style={styles.secondaryActionButtonText}>{t("camera.selectSource")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.closeButtonText}>{t("common.close")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

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
    zIndex: 1,
  },
  frame: {
    width: 300,
    height: 400,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -200, // Half of height to center vertically
    marginLeft: -150, // Half of width to center horizontally
  },
  corner: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#22c55e",
  },
  cornerTopRight: {
    left: undefined,
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    top: undefined,
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 4,
  },
  cornerBottomRight: {
    top: undefined,
    left: undefined,
    right: 0,
    bottom: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    gap: 20,
  },
  tipBox: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 24,
  },
  tipText: {
    color: "#fbbf24",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  tipSubText: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#22c55e",
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#22c55e",
  },
  bottomButtonRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  secondaryActionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  secondaryActionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4b5563",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
