import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View, Image, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { type Recipe } from "@/lib/api/fetch-recipes";
import { useTranslation } from "@/hooks/use-translation";

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
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  let recipe: Recipe | null = null;
  try {
    recipe = JSON.parse(recipeString as string);
  } catch (error) {
    console.error("Failed to parse recipe data:", error);
  }

  if (!recipe) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-neutral-900">
        <Text className="text-neutral-500 dark:text-neutral-400 text-lg">{t("recipe.notFound")}</Text>
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
        className="p-2 rounded-lg active:bg-neutral-100 dark:active:bg-neutral-800"
      >
        <Ionicons name="chevron-back" size={24} color={isDark ? "#fafafa" : "#171717"} />
      </TouchableOpacity>
      <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex-1 ml-2">
        {t("recipe.recipeDetails")}
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
        <Text className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
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
              ? t("recipe.aiGenerated")
              : recipe.source === "user"
                ? t("recipe.myRecipes")
                : t("recipe.community")}
          </Text>
        </View>
      </Animated.View>

      {/* Description */}
      {recipe.description && (
        <Animated.View
          entering={FadeInUp.delay(150).duration(400)}
          className="px-4 pb-6"
        >
          <Text className="text-neutral-600 dark:text-neutral-400 text-base leading-6">
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
        <View className="flex-1 bg-white dark:bg-neutral-800 rounded-2xl p-4">
          <Text className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mb-2">
            INGREDIENTS
          </Text>
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {ingredientCount}
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            ingredient{ingredientCount > 1 ? "s" : ""}
          </Text>
        </View>

        {/* Preparation Time */}
        {recipe.preparationTime && (
          <View className="flex-1 bg-white dark:bg-neutral-800 rounded-2xl p-4">
            <Text className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mb-2">
              PREP TIME
            </Text>
            <View className="flex-row items-center gap-2">
              <Ionicons name="time-outline" size={20} color="#3b82f6" />
              <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {recipe.preparationTime}
              </Text>
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">{t("recipe.minutes")}</Text>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Instructions Section */}
      <Animated.View
        entering={FadeInUp.delay(250).duration(400)}
        className="px-4 pb-6"
      >
        <View className="bg-white dark:bg-neutral-800 rounded-2xl p-5">
          <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Instructions
          </Text>
          {formatDescription(recipe.instructions).map((step, idx, arr) => (
            <Text
              key={idx}
              className="text-base text-neutral-700 dark:text-neutral-300 leading-7"
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
          <View className="bg-white dark:bg-neutral-800 rounded-2xl p-5">
            <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
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
                    borderBottomColor: isDark ? "#404040" : "#f3f4f6",
                  }}
                >
                  <View className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center">
                    <MaterialCommunityIcons
                      name="check"
                      size={14}
                      color="#3b82f6"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-900 dark:text-neutral-100 font-medium">
                      {ingredient.label}
                    </Text>
                    {ingredient.quantity && ingredient.unit && (
                      <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {ingredient.quantity} {ingredient.unit}
                      </Text>
                    )}
                  </View>
                  {ingredient.product && (
                    <View className="bg-green-50 dark:bg-green-900 px-2 py-1 rounded">
                      <Text className="text-xs text-green-700 dark:text-green-300 font-medium">
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
          <View className="bg-white dark:bg-neutral-800 rounded-2xl p-5">
            <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">{t("recipe.tags")}</Text>
            <View className="flex-row flex-wrap gap-2">
              {recipe.tags.map((tag, idx) => (
                <View key={idx} className="bg-neutral-100 dark:bg-neutral-700 px-3 py-2 rounded-full">
                  <Text className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
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
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      {headerComponent}
      <ScrollView showsVerticalScrollIndicator={false}>
        {scrollContent}
      </ScrollView>
    </SafeAreaView>
  );
}
