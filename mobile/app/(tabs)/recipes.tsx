import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useRecipes } from "@/hooks/use-recipes";
import { RecipeList } from "@/components/recipe-list";

export default function RecipesScreen() {
  const router = useRouter();
  const { data: recipes = [], isLoading, refetch } = useRecipes();
  const [filter, setFilter] = React.useState<"all" | "ai" | "user" | "community">("all");

  const filteredRecipes = React.useMemo(() => {
    if (filter === "all") return recipes;
    return recipes.filter((recipe) => recipe.source === filter);
  }, [recipes, filter]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="px-4 py-3"
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-900">My Recipes</Text>
          <TouchableOpacity
            onPress={() => router.push("/recipe/generate")}
            className="w-10 h-10 rounded-full bg-black items-center justify-center"
          >
            <Ionicons name="sparkles" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row gap-2">
          {[
            { value: "all", label: "All" },
            { value: "ai", label: "AI" },
            { value: "user", label: "My Recipes" },
            { value: "community", label: "Community" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.value}
              onPress={() => setFilter(tab.value as any)}
              className={`px-4 py-2 rounded-full ${
                filter === tab.value ? "bg-black" : "bg-white"
              }`}
            >
              <Text
                className={`font-medium ${
                  filter === tab.value ? "text-white" : "text-gray-700"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Recipes List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : filteredRecipes.length === 0 ? (
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          className="flex-1 items-center justify-center px-6"
        >
          <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Ionicons name="restaurant-outline" size={40} color="#9ca3af" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">
            No Recipes Yet
          </Text>
          <Text className="text-center text-gray-600 mb-6">
            Generate your first recipe using AI or add your own recipes manually
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/recipe/generate")}
            className="bg-black px-6 py-3 rounded-xl flex-row items-center gap-2"
          >
            <Ionicons name="sparkles" size={20} color="white" />
            <Text className="text-white font-semibold">Generate Recipe</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <RecipeList
          recipes={filteredRecipes}
          refresh={refetch}
          isLoading={isLoading}
        />
      )}
    </SafeAreaView>
  );
}
