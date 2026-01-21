import { Product } from "@/lib/api/fetch-products";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,

} from "react-native-reanimated";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useRef, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "@/hooks/use-translation";

const getCategoryColor = (category: string, isDark: boolean): string => {
  const lightColors: Record<string, string> = {
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
  const darkColors: Record<string, string> = {
    vegetables: "#14532d",
    dairy: "#1e3a5f",
    meat: "#7c2d12",
    poultry: "#44403c",
    fruits: "#78350f",
    beverages: "#0c4a6e",
    snacks: "#713f12",
    condiments: "#44403c",
    bread: "#78350f",
    pantry: "#581c87",
  };
  const colors = isDark ? darkColors : lightColors;
  return colors[category.toLowerCase()] || (isDark ? "#262626" : "#F5F5F5");
};

const getCategoryTextColor = (category: string, isDark: boolean): string => {
  const lightColors: Record<string, string> = {
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
  const darkColors: Record<string, string> = {
    vegetables: "#86efac",
    dairy: "#93c5fd",
    meat: "#fdba74",
    poultry: "#d6d3d1",
    fruits: "#fcd34d",
    beverages: "#7dd3fc",
    snacks: "#fcd34d",
    condiments: "#d6d3d1",
    bread: "#fbbf24",
    pantry: "#d8b4fe",
  };
  const colors = isDark ? darkColors : lightColors;
  return colors[category.toLowerCase()] || (isDark ? "#e5e5e5" : "#424242");
};

const getCategoryIcon = (category: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  const icons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
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

const formatDate = (dateString: string | null, noExpiryText: string): string => {
  if (!dateString) return noExpiryText;
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
};

const isExpiringSoon = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false;
  const expiry = new Date(expiresAt);
  const today = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
};

const isExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onDelete?: (productId: string) => void;
  onMarkOpened?: (productId: string) => void;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onDelete,
  onMarkOpened,
  index,
}) => {
  const swipeRef = useRef<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = getCategoryColor(product.category, isDark);
  const textColor = getCategoryTextColor(product.category, isDark);
  const expiring = isExpiringSoon(product.expiresAt);
  const expired = isExpired(product.expiresAt);

  const dotColor = expired ? "#EF4444" : expiring ? "#FBBF24" : "#4CAF50";

  const handlePress = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    onPress();
    setTimeout(() => setIsProcessing(false), 1000);
  };

  const handleDelete = () => {
    onDelete?.(product.id);
    swipeRef.current?.close();
  };

  const handleMarkOpened = () => {
    onMarkOpened?.(product.id);
    swipeRef.current?.close();
  };

  const renderRightActions = () => (
    <View className="flex-row gap-2 ml-2">
      <TouchableOpacity
        onPress={handleMarkOpened}
        className="justify-center items-center px-5 rounded-2xl"
        style={{ backgroundColor: "#3B82F6" }}
        activeOpacity={0.8}
      >
        <Ionicons name="cube-outline" size={24} color="white" />
        <Text className="text-white font-semibold text-xs mt-1">{t("product.opened")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleDelete}
        className="justify-center items-center px-5 rounded-2xl"
        style={{ backgroundColor: "#EF4444" }}
        activeOpacity={0.8}
      >
        <Ionicons name="checkmark-circle-outline" size={24} color="white" />
        <Text className="text-white font-semibold text-xs mt-1">{t("product.consumed")}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={40}
    >
      <TouchableOpacity
        onPress={handlePress}
        className="w-full"
        activeOpacity={0.8}
        disabled={isProcessing}
        testID={`product-card-${product.id}`}
      >
        <Animated.View
          entering={FadeInDown.delay(index ? index * 50 : 0)
            .springify()
            .damping(100)
            .stiffness(600)}
          exiting={FadeOutUp.springify()}
          layout={LinearTransition.springify().damping(80).stiffness(600)}
          className="flex-row items-center justify-between p-4 rounded-2xl h-20"
          style={{ backgroundColor: bgColor }}
        >
          <View className="flex-row items-center flex-1 gap-3">
            <MaterialCommunityIcons
              name={getCategoryIcon(product.category)}
              size={28}
              color={textColor}
            />
            <View className="flex-1">
              <Text
                className="text-lg font-bold"
                style={{ color: textColor }}
                numberOfLines={1}
              >
                {product.name}
              </Text>
              <Text
                className="text-sm opacity-80"
                style={{ color: textColor }}
                numberOfLines={1}
              >
                {product.quantity} {product.unit} • {product.location}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <View className="flex-row items-center gap-2">
              <View
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: dotColor }}
              />
              <Text
                className="text-sm font-medium"
                style={{ color: textColor }}
              >
                {formatDate(product.expiresAt, t("common.noExpiryDate"))}
              </Text>
            </View>
            <View className="flex-row gap-2 mt-1">
              <Text
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: textColor,
                  color: bgColor,
                  opacity: 0.9,
                }}
              >
                {product.category}
              </Text>
              {expired && (
                <Text
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "#EF4444",
                    color: "white",
                  }}
                >
                  {t("fridge.expired")}
                </Text>
              )}
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </ReanimatedSwipeable>
  );
};
