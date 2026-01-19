import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { type Recipe } from "@/lib/api/fetch-recipes";

const getSourceBadgeColor = (source: "ai" | "user" | "community") => {
  switch (source) {
    case "ai":
      return { bg: "#faf5ff", text: "#a855f7" };
    case "user":
      return { bg: "#eff6ff", text: "#3b82f6" };
    case "community":
      return { bg: "#ecfdf5", text: "#10b981" };
  }
};

const getSourceIcon = (source: "ai" | "user" | "community") => {
  switch (source) {
    case "ai":
      return "sparkles";
    case "user":
      return "person";
    case "community":
      return "people";
  }
};

const formatDescription = (description: string): string[] => {
  // Split by numbered points (1. 2. 3. etc.) - handles both "1. " and "1) " formats
  const parts = description.split(/\s*(?=\d+[\.\)]\s)/);
  return parts.map((part) => part.trim()).filter((part) => part.length > 0);
};

export default function RecipeDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { recipe: recipeString } = params;

  let recipe: Recipe | null = null;
  try {
    recipe = JSON.parse(recipeString as string);
  } catch (error) {
    console.error("Failed to parse recipe data:", error);
  }

  if (!recipe) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500 text-lg">Recette non trouvée.</Text>
      </SafeAreaView>
    );
  }

  const sourceColors = getSourceBadgeColor(recipe.source);
  const ingredientCount = recipe.ingredients?.length ?? 0;

  const headerComponent = (
    <Animated.View
      entering={FadeInDown.duration(400)}
      className="px-4 py-3 flex-row items-center"
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="p-2 rounded-lg active:bg-gray-100"
      >
        <Ionicons name="chevron-back" size={24} color="#1f2937" />
      </TouchableOpacity>
      <Text className="text-xl font-bold text-gray-900 flex-1 ml-2">
        Recipe
      </Text>
    </Animated.View>
  );

  const scrollContent = (
    <>
      {/* Recipe Image */}
      {recipe.imageUrl && (
        <Animated.View entering={FadeInUp.duration(400)}>
          <Image
            source={{ uri: recipe.imageUrl }}
            className="w-full h-56"
            resizeMode="cover"
          />
        </Animated.View>
      )}

      {/* Title Section */}
      <Animated.View
        entering={FadeInUp.delay(100).duration(400)}
        className="px-4 py-6"
      >
        <Text className="text-4xl font-bold text-gray-900 mb-4">
          {recipe.title}
        </Text>

        {/* Source Badge */}
        <View
          className="self-start px-3 py-2 rounded-full mb-4 flex-row items-center gap-2"
          style={{ backgroundColor: sourceColors.bg }}
        >
          <Ionicons
            name={getSourceIcon(recipe.source) as any}
            size={14}
            color={sourceColors.text}
          />
          <Text
            className="text-sm font-semibold"
            style={{ color: sourceColors.text }}
          >
            {recipe.source === "ai"
              ? "AI Generated"
              : recipe.source === "user"
                ? "Your Recipe"
                : "Community"}
          </Text>
        </View>
      </Animated.View>

      {/* Description */}
      {recipe.description && (
        <Animated.View
          entering={FadeInUp.delay(150).duration(400)}
          className="px-4 pb-6"
        >
          <Text className="text-gray-600 text-base leading-6">
            {recipe.description}
          </Text>
        </Animated.View>
      )}

      {/* Info Grid */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(400)}
        className="px-4 pb-6 flex-row gap-3"
      >
        {/* Ingredients Count */}
        <View className="flex-1 bg-white rounded-2xl p-4">
          <Text className="text-xs text-gray-600 font-medium mb-2">
            INGREDIENTS
          </Text>
          <Text className="text-2xl font-bold text-gray-900">
            {ingredientCount}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            ingredient{ingredientCount > 1 ? "s" : ""}
          </Text>
        </View>

        {/* Preparation Time */}
        {recipe.preparationTime && (
          <View className="flex-1 bg-white rounded-2xl p-4">
            <Text className="text-xs text-gray-600 font-medium mb-2">
              PREP TIME
            </Text>
            <View className="flex-row items-center gap-2">
              <Ionicons name="time-outline" size={20} color="#3b82f6" />
              <Text className="text-2xl font-bold text-gray-900">
                {recipe.preparationTime}
              </Text>
              <Text className="text-sm text-gray-500">min</Text>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Instructions Section */}
      <Animated.View
        entering={FadeInUp.delay(250).duration(400)}
        className="px-4 pb-6"
      >
        <View className="bg-white rounded-2xl p-5">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Instructions
          </Text>
          {formatDescription(recipe.instructions).map((step, idx, arr) => (
            <Text
              key={idx}
              className="text-base text-gray-700 leading-7"
              style={{ marginBottom: idx < arr.length - 1 ? 12 : 0 }}
            >
              {step}
            </Text>
          ))}
        </View>
      </Animated.View>

      {/* Ingredients Section */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <Animated.View
          entering={FadeInUp.delay(300).duration(400)}
          className="px-4 pb-6"
        >
          <View className="bg-white rounded-2xl p-5">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Ingredients
            </Text>
            <View className="gap-3">
              {recipe.ingredients.map((ingredient, idx) => (
                <View
                  key={ingredient.id}
                  className="flex-row items-center gap-3 pb-3"
                  style={{
                    borderBottomWidth:
                      idx < recipe.ingredients!.length - 1 ? 1 : 0,
                    borderBottomColor: "#f3f4f6",
                  }}
                >
                  <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center">
                    <MaterialCommunityIcons
                      name="check"
                      size={14}
                      color="#3b82f6"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">
                      {ingredient.label}
                    </Text>
                    {ingredient.quantity && ingredient.unit && (
                      <Text className="text-sm text-gray-500 mt-0.5">
                        {ingredient.quantity} {ingredient.unit}
                      </Text>
                    )}
                  </View>
                  {ingredient.product && (
                    <View className="bg-green-50 px-2 py-1 rounded">
                      <Text className="text-xs text-green-700 font-medium">
                        In fridge
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      )}

      {/* Tags Section */}
      {recipe.tags && recipe.tags.length > 0 && (
        <Animated.View
          entering={FadeInUp.delay(350).duration(400)}
          className="px-4 pb-20"
        >
          <View className="bg-white rounded-2xl p-5">
            <Text className="text-lg font-bold text-gray-900 mb-4">Tags</Text>
            <View className="flex-row flex-wrap gap-2">
              {recipe.tags.map((tag, idx) => (
                <View key={idx} className="bg-gray-100 px-3 py-2 rounded-full">
                  <Text className="text-sm text-gray-700 font-medium">
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      )}
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {headerComponent}
      <ScrollView showsVerticalScrollIndicator={false}>
        {scrollContent}
      </ScrollView>
    </SafeAreaView>
  );
}
