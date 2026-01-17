import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useRecipes } from "@/hooks/use-recipes";
import { RecipeList } from "@/components/recipe-list";
import { Chip } from "@/components/ui/chip";
import Header from "@/components/ui/header";

export default function RecipesScreen() {
  const router = useRouter();
  const { data: recipes = [], isLoading, refetch } = useRecipes();
  const [filter, setFilter] = React.useState<"all" | "ai" | "user" | "community">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredRecipes = React.useMemo(() => {
    let filtered = recipes;
    
    // Filter by source
    if (filter !== "all") {
      filtered = filtered.filter((recipe) => recipe.source === filter);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((recipe) =>
        recipe.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [recipes, filter, searchQuery]);

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-gray-50">
      <Header title="Recipes" />
      
      {/* Filter Tabs */}
      <ScrollView
        horizontal
        className="flex-grow-0"
        contentContainerClassName="flex items-center gap-1 flex flex-row mb-4 px-4 h-12"
        showsHorizontalScrollIndicator={false}
      >
        {[
          { value: "all" as const, label: "All", icon: "grid-outline" },
          { value: "ai" as const, label: "AI", icon: "sparkles" },
          { value: "user" as const, label: "My Recipes", icon: "person" },
          { value: "community" as const, label: "Community", icon: "people" },
        ].map((tab) => (
          <Chip
            key={tab.value}
            label={tab.label}
            isActive={filter === tab.value}
            onPress={() => setFilter(tab.value)}
            icon={
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={filter === tab.value ? "white" : "#6b7280"}
              />
            }
          />
        ))}
      </ScrollView>

      {/* Search Bar */}
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
            No Recipes Found
          </Text>
          <Text className="text-center text-gray-600">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Generate your first recipe using AI"}
          </Text>
        </Animated.View>
      ) : (
        <RecipeList
          recipes={filteredRecipes}
          refresh={refetch}
          isLoading={isLoading}
        />
      )}

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
