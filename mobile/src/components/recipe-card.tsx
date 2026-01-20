import React from "react";
import { View, Text, TouchableOpacity, Image, useColorScheme } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { type Recipe } from "@/lib/api/fetch-recipes";
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import { useTranslation } from "@/hooks/use-translation";

type RecipeCardProps = {
  recipe: Recipe;
  onPress: () => void;
  index: number;
};

const getSourceColor = (source: string, isDark: boolean): string => {
  const lightColors: Record<string, string> = {
    ai: "#F3E8FF",
    user: "#E0F2FE",
    community: "#FEF3C7",
  };
  const darkColors: Record<string, string> = {
    ai: "#581c87",
    user: "#0c4a6e",
    community: "#78350f",
  };
  const colors = isDark ? darkColors : lightColors;
  return colors[source] || (isDark ? "#262626" : "#F5F5F5");
};

const getSourceTextColor = (source: string, isDark: boolean): string => {
  const lightColors: Record<string, string> = {
    ai: "#7C3AED",
    user: "#0369A1",
    community: "#D97706",
  };
  const darkColors: Record<string, string> = {
    ai: "#d8b4fe",
    user: "#7dd3fc",
    community: "#fcd34d",
  };
  const colors = isDark ? darkColors : lightColors;
  return colors[source] || (isDark ? "#e5e5e5" : "#424242");
};

const getSourceIcon = (
  source: string
): keyof typeof MaterialCommunityIcons.glyphMap => {
  const icons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
    ai: "robot-outline",
    user: "account-outline",
    community: "account-group-outline",
  };
  return icons[source] || "food-outline";
};

const getSourceLabel = (source: string, t: (key: string) => string): string => {
  const labels: Record<string, string> = {
    ai: t("recipe.aiGenerated"),
    user: t("recipe.myRecipes"),
    community: t("recipe.community"),
  };
  return labels[source] || source;
};

export function RecipeCard({ recipe, onPress, index }: RecipeCardProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const ingredientCount = recipe.ingredients?.length ?? 0;
  const prepTime = recipe.preparationTime;
  const bgColor = getSourceColor(recipe.source, isDark);
  const textColor = getSourceTextColor(recipe.source, isDark);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-full"
      activeOpacity={0.8}
      testID={`recipe-card-${recipe.id}`}
    >
      <Animated.View
        entering={FadeInDown.delay(index * 50)
          .springify()
          .damping(100)
          .stiffness(600)}
        exiting={FadeOutUp.springify()}
        layout={LinearTransition.springify().damping(80).stiffness(600)}
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        {recipe.imageUrl && (
          <Image
            source={{ uri: recipe.imageUrl }}
            className="w-full h-32"
            resizeMode="cover"
          />
        )}
        <View className="p-4 flex-row items-start gap-3">
          <MaterialCommunityIcons
            name={getSourceIcon(recipe.source)}
            size={28}
            color={textColor}
          />
          <View className="flex-1">
            <Text
              className="text-lg font-bold"
              style={{ color: textColor }}
              numberOfLines={1}
            >
              {recipe.title}
            </Text>
            {recipe.description && (
              <Text
                className="text-sm opacity-80 mt-1"
                style={{ color: textColor }}
                numberOfLines={2}
              >
                {recipe.description}
              </Text>
            )}
            <View className="flex-row items-center flex-wrap gap-3 mt-2">
              {prepTime && (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="time-outline" size={14} color={textColor} />
                  <Text className="text-xs" style={{ color: textColor }}>
                    {prepTime} min
                  </Text>
                </View>
              )}
              {ingredientCount > 0 && (
                <View className="flex-row items-center gap-1">
                  <MaterialCommunityIcons
                    name="pot-mix"
                    size={14}
                    color={textColor}
                  />
                  <Text className="text-xs" style={{ color: textColor }}>
                    {ingredientCount} ingredient{ingredientCount > 1 ? "s" : ""}
                  </Text>
                </View>
              )}
              <View
                className="px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: textColor,
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: bgColor }}
                >
                  {getSourceLabel(recipe.source, t)}
                </Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={textColor} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}
