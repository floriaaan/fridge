import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { type Recipe } from "@/api/fetch-recipes";
import Animated, { FadeInRight } from "react-native-reanimated";

type RecipeCardProps = {
  recipe: Recipe;
  onPress: () => void;
  index: number;
};

const getSourceIcon = (source: "ai" | "user" | "community") => {
  switch (source) {
    case "ai":
      return <Ionicons name="sparkles" size={14} color="#a855f7" />;
    case "user":
      return <Ionicons name="person" size={14} color="#3b82f6" />;
    case "community":
      return <Ionicons name="people" size={14} color="#10b981" />;
  }
};

const getSourceLabel = (source: "ai" | "user" | "community") => {
  switch (source) {
    case "ai":
      return "AI Generated";
    case "user":
      return "Your Recipe";
    case "community":
      return "Community";
  }
};

const getSourceColor = (source: "ai" | "user" | "community") => {
  switch (source) {
    case "ai":
      return "#faf5ff";
    case "user":
      return "#eff6ff";
    case "community":
      return "#ecfdf5";
  }
};

export function RecipeCard({ recipe, onPress, index }: RecipeCardProps) {
  const ingredientCount = recipe.ingredients?.length ?? 0;
  const prepTime = recipe.preparationTime;

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(300)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="bg-white rounded-2xl overflow-hidden shadow-sm"
      >
        {/* Header with source badge */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text
                className="text-xl font-bold text-gray-900"
                numberOfLines={2}
              >
                {recipe.title}
              </Text>
            </View>
            <View
              className="px-2.5 py-1.5 rounded-full ml-2"
              style={{ backgroundColor: getSourceColor(recipe.source) }}
            >
              <View className="flex-row items-center gap-1">
                {getSourceIcon(recipe.source)}
                <Text className="text-xs font-semibold text-gray-700">
                  {getSourceLabel(recipe.source)}
                </Text>
              </View>
            </View>
          </View>

          {recipe.description && (
            <Text
              className="text-sm text-gray-600 mb-3"
              numberOfLines={2}
            >
              {recipe.description}
            </Text>
          )}
        </View>

        {/* Info row */}
        <View className="px-4 pb-4 flex-row gap-4">
          {/* Ingredients */}
          {ingredientCount > 0 && (
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons
                name="pot-mix"
                size={16}
                color="#6b7280"
              />
              <Text className="text-sm text-gray-600">
                {ingredientCount} ingredient{ingredientCount > 1 ? "s" : ""}
              </Text>
            </View>
          )}

          {/* Preparation time */}
          {prepTime && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600">{prepTime} min</Text>
            </View>
          )}
        </View>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <View className="px-4 pb-4 flex-row flex-wrap gap-2">
            {recipe.tags.slice(0, 3).map((tag, idx) => (
              <View
                key={idx}
                className="bg-gray-100 px-2.5 py-1 rounded-full"
              >
                <Text className="text-xs text-gray-700 font-medium">
                  {tag}
                </Text>
              </View>
            ))}
            {recipe.tags.length > 3 && (
              <View className="bg-gray-100 px-2.5 py-1 rounded-full">
                <Text className="text-xs text-gray-700 font-medium">
                  +{recipe.tags.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
