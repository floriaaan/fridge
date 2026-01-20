import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  TextInput,
  useColorScheme,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { type Recipe } from "@/lib/api/fetch-recipes";
import { RecipeCard } from "@/components/recipe-card";
import { Chip } from "@/components/ui/chip";
import { useTranslation } from "@/hooks/use-translation";

type RecipeListProps = {
  recipes: Recipe[];
  refresh: () => void;
  isLoading: boolean;
};

export function RecipeList({ recipes, refresh, isLoading }: RecipeListProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeFilter, setActiveFilter] = useState<
    "all" | "ai" | "user" | "community"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = recipes
    .filter((recipe) => {
      if (activeFilter === "all") return true;
      return recipe.source === activeFilter;
    })
    .filter((recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleRecipePress = (recipe: Recipe) => {
    router.push({
      pathname: `/recipe/[id]`,
      params: { id: recipe.id, recipe: JSON.stringify(recipe) },
    });
  };

  const chipIconColor = (isActive: boolean) => isActive ? (isDark ? "#171717" : "#ffffff") : (isDark ? "#a3a3a3" : "#6b7280");

  return (
    <>
      <ScrollView
        horizontal
        className="flex-grow-0"
        contentContainerClassName="flex items-center gap-1 flex flex-row mb-4 px-4 h-12"
        showsHorizontalScrollIndicator={false}
      >
        <Chip
          label={t("common.all")}
          isActive={activeFilter === "all"}
          onPress={() => setActiveFilter("all")}
          icon={
            <Ionicons
              name="grid-outline"
              size={16}
              color={chipIconColor(activeFilter === "all")}
            />
          }
        />
        <Chip
          label={t("recipe.aiGenerated")}
          isActive={activeFilter === "ai"}
          onPress={() => setActiveFilter("ai")}
          icon={
            <Ionicons
              name="sparkles"
              size={16}
              color={chipIconColor(activeFilter === "ai")}
            />
          }
        />
        <Chip
          label={t("recipe.myRecipes")}
          isActive={activeFilter === "user"}
          onPress={() => setActiveFilter("user")}
          icon={
            <Ionicons
              name="person"
              size={16}
              color={chipIconColor(activeFilter === "user")}
            />
          }
        />
        <Chip
          label={t("recipe.community")}
          isActive={activeFilter === "community"}
          onPress={() => setActiveFilter("community")}
          icon={
            <Ionicons
              name="people"
              size={16}
              color={chipIconColor(activeFilter === "community")}
            />
          }
        />
      </ScrollView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={isDark ? "white" : "black"}
          />
        }
      >
        <View className="px-4 mb-4">
          <View className="flex-row items-center bg-neutral-200 dark:bg-neutral-700 rounded-xl px-4 py-3">
            <MaterialIcons name="search" size={20} color={isDark ? "#a3a3a3" : "#6B7280"} />
            <TextInput
              className="flex-1 ml-3 text-neutral-900 dark:text-neutral-100"
              onChangeText={setSearchQuery}
              value={searchQuery}
              placeholder={t("fridge.searchPlaceholder")}
              placeholderTextColor={isDark ? "#737373" : "#9CA3AF"}
            />
          </View>
        </View>

        <View className="flex flex-col flex-1 px-4 gap-3">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onPress={() => handleRecipePress(recipe)}
                index={index}
              />
            ))
          ) : (
            <View className="flex-1 items-center justify-center mt-20">
              <Ionicons
                name="book-outline"
                size={48}
                color={isDark ? "#525252" : "#d1d5db"}
                style={{ marginBottom: 12 }}
              />
              <Text className="text-neutral-500 dark:text-neutral-400 text-lg font-medium">
                No recipes found
              </Text>
              <Text className="text-neutral-400 dark:text-neutral-500 text-sm mt-2">
                {recipes.length === 0
                  ? t("recipe.generate")
                  : "Try a different search"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
