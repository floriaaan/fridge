import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  TextInput,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { type Recipe } from "@/lib/api/fetch-recipes";
import { RecipeCard } from "@/components/recipe-card";
import { Chip } from "@/components/ui/chip";

type RecipeListProps = {
  recipes: Recipe[];
  refresh: () => void;
  isLoading: boolean;
};

export function RecipeList({ recipes, refresh, isLoading }: RecipeListProps) {
  const router = useRouter();
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

  return (
    <>
      <ScrollView
        horizontal
        className="flex-grow-0"
        contentContainerClassName="flex items-center gap-1 flex flex-row mb-4 px-4 h-12"
        showsHorizontalScrollIndicator={false}
      >
        <Chip
          label="All"
          isActive={activeFilter === "all"}
          onPress={() => setActiveFilter("all")}
        />
        <Chip
          label="AI Generated"
          isActive={activeFilter === "ai"}
          onPress={() => setActiveFilter("ai")}
        />
        <Chip
          label="My Recipes"
          isActive={activeFilter === "user"}
          onPress={() => setActiveFilter("user")}
        />
        <Chip
          label="Community"
          isActive={activeFilter === "community"}
          onPress={() => setActiveFilter("community")}
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
            tintColor="black"
          />
        }
      >
        <View className="px-4 mb-4">
          <View className="flex-row items-center bg-gray-200 rounded-xl px-4 py-3">
            <MaterialIcons name="search" size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              onChangeText={setSearchQuery}
              value={searchQuery}
              placeholder="Search recipes..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View className="flex flex-col flex-1 px-4 gap-4">
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
                color="#d1d5db"
                style={{ marginBottom: 12 }}
              />
              <Text className="text-gray-500 text-lg font-medium">
                No recipes found
              </Text>
              <Text className="text-gray-400 text-sm mt-2">
                {recipes.length === 0
                  ? "Generate recipes using your products"
                  : "Try a different search"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
