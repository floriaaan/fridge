import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRecipes } from "@/hooks/use-recipes";
import Header from "@/components/ui/header";
import { RecipeList } from "@/components/recipe-list";

export default function RecipesScreen() {
  const router = useRouter();
  const { data: recipes = [], isLoading, refetch } = useRecipes();

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-gray-50"
    >
      <Header title="Recipes" />

      <RecipeList recipes={recipes} refresh={refetch} isLoading={isLoading} />

      <View className="absolute bottom-5 left-5 right-5">
        <TouchableOpacity
          onPress={() => router.push("/recipe/generate")}
          className="bg-black py-4 rounded-xl shadow-xl flex-row items-center justify-center"
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={24} color="white" />
          <Text className="text-white font-semibold text-base ml-2">
            Generate Recipe
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
