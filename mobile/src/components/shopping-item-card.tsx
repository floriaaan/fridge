import React, { useRef, useState, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from "react-native";
import { type ShoppingItem } from "@/lib/api/fetch-shopping-items";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useUpdateShoppingItems } from "@/hooks/use-update-shopping-items";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

type ShoppingItemCardProps = {
  item: ShoppingItem;
  onToggleCheck?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  index?: number;
};

const getSourceColor = (source: string, isDark: boolean): string => {
  const lightColors: Record<string, string> = {
    manual: "#E8F5E9",
    auto_expired: "#FFF3E0",
    recipe: "#E3F2FD",
  };
  const darkColors: Record<string, string> = {
    manual: "#14532d",
    auto_expired: "#78350f",
    recipe: "#1e3a5f",
  };
  const colors = isDark ? darkColors : lightColors;
  return colors[source] || (isDark ? "#262626" : "#F5F5F5");
};

const getSourceTextColor = (source: string, isDark: boolean): string => {
  const lightColors: Record<string, string> = {
    manual: "#2E7D32",
    auto_expired: "#EF6C00",
    recipe: "#1565C0",
  };
  const darkColors: Record<string, string> = {
    manual: "#86efac",
    auto_expired: "#fcd34d",
    recipe: "#93c5fd",
  };
  const colors = isDark ? darkColors : lightColors;
  return colors[source] || (isDark ? "#e5e5e5" : "#424242");
};

const getSourceIcon = (source: string): keyof typeof Ionicons.glyphMap => {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    manual: "create-outline",
    auto_expired: "time-outline",
    recipe: "restaurant-outline",
  };
  return icons[source] || "cube-outline";
};

const getSourceLabel = (source: string, t: (key: string) => string): string => {
  const labels: Record<string, string> = {
    manual: t("shoppingList.manual"),
    auto_expired: t("shoppingList.autoExpired"),
    recipe: t("shoppingList.fromRecipes"),
  };
  return labels[source] || source;
};

export function ShoppingItemCard({
  item,
  onToggleCheck,
  onDelete,
  index,
}: ShoppingItemCardProps) {
  const swipeRef = useRef<any>(null);
  const { mutate: updateShoppingItems } = useUpdateShoppingItems();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(item.name);
  const bgColor = getSourceColor(item.source, isDark);
  const textColor = getSourceTextColor(item.source, isDark);
  const sourceIcon = getSourceIcon(item.source);
  // Ensure checked is a proper boolean (backend may return 0/1)
  const isChecked = Boolean(item.checked);

  const animatedOpacityStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isChecked ? 0.5 : 1, { duration: 200 }),
  }));

  const handleToggleCheck = () => {
    onToggleCheck?.(item.id);
  };

  const handleDelete = () => {
    onDelete?.(item.id);
    swipeRef.current?.close();
  };

  const handleLongPress = () => {
    setDraftName(item.name);
    setIsEditing(true);
  };

  const handleSubmitEdit = useCallback(() => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setDraftName(item.name);
      setIsEditing(false);
      return;
    }

    if (trimmed !== item.name) {
      updateShoppingItems([{ id: item.id, name: trimmed }]);
    }

    setIsEditing(false);
  }, [draftName, item.id, item.name, updateShoppingItems]);

  const renderRightActions = () => (
    <View className="flex-row gap-2 ml-2">
      <TouchableOpacity
        onPress={handleDelete}
        className="justify-center items-center px-5 rounded-2xl"
        style={{ backgroundColor: "#EF4444" }}
        activeOpacity={0.8}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
        <Text className="text-white font-semibold text-xs mt-1">
          {t("common.delete")}
        </Text>
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
        onPress={handleToggleCheck}
        onLongPress={handleLongPress}
        className="w-full"
        activeOpacity={0.8}
      >
        <Animated.View
          entering={FadeInDown.delay(index ? index * 50 : 0)
            .springify()
            .damping(100)
            .stiffness(600)}
          exiting={FadeOutUp.springify()}
          className={cn(
            "flex-row items-center justify-between p-4 rounded-2xl h-20",

          )}
          style={[{ backgroundColor: bgColor }, animatedOpacityStyle]}
        >
          <View className="flex-row items-center flex-1 gap-3">
            <View
              className="w-6 h-6 rounded-full border-2 items-center justify-center"
              style={{
                borderColor: textColor,
                backgroundColor: isChecked ? textColor : "transparent",
              }}
            >
              {isChecked && (
                <Ionicons name="checkmark" size={16} color={bgColor} />
              )}
            </View>
            <View className="flex-1">
              {isEditing ? (
                <TextInput
                  value={draftName}
                  onChangeText={setDraftName}
                  autoFocus
                  onBlur={handleSubmitEdit}
                  onSubmitEditing={handleSubmitEdit}
                  returnKeyType="done"
                  className=""
                  style={{ color: textColor }}
                  placeholder={t("shoppingList.itemName")}
                  placeholderTextColor={textColor}
                />
              ) : (
                <>
                  <Text
                    className="font-bold"
                    style={{
                      color: textColor,
                      textDecorationLine: isChecked ? "line-through" : "none",
                    }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    className="text-xs mt-1"
                    style={{
                      color: textColor,
                      opacity: 0.6,
                    }}
                  >
                    {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </>
              )}
            </View>
          </View>
          <View className="items-end gap-2">
            <View className="flex-row items-center gap-2">
              <Text
                className="text-sm font-semibold"
                style={{
                  color: textColor,
                }}
              >
                {item.quantity} {item.unit}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text
                className="text-xs px-2 py-0.5 rounded-full font-medium flex-row items-center"
                style={{
                  backgroundColor: textColor,
                  color: bgColor,
                  opacity: 0.9,
                }}
              >
                <Ionicons
                  name={sourceIcon}
                  size={12}
                  color={bgColor}
                  style={{ marginRight: 4 }}
                />
                {getSourceLabel(item.source, t)}
              </Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </ReanimatedSwipeable>
  );
}
