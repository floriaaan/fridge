import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useGenerateRecipes, useRecipes } from "@/hooks/use-recipes";
import { RecipeList } from "@/components/recipe-list";
import { GenerateRecipesParams } from "@/lib/api/fetch-recipes";

const CUISINES = [
  "Italian",
  "French",
  "Asian",
  "Mexican",
  "Indian",
  "Mediterranean",
  "American",
  "Japanese",
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
] as const;

export default function RecipeGenerate() {
  const router = useRouter();
  const generateMutation = useGenerateRecipes();
  const {
    data: recipes = [],
    isLoading: isRecipesLoading,
    refetch,
  } = useRecipes();
  const [hasGenerated, setHasGenerated] = React.useState(false);
  
  // Generation parameters state
  const [selectedCuisine, setSelectedCuisine] = React.useState<string | undefined>();
  const [difficulty, setDifficulty] = React.useState<"easy" | "medium" | "hard" | undefined>();
  const [maxTime, setMaxTime] = React.useState(60);
  const [servings, setServings] = React.useState(4);

  const handleGenerateRecipe = async () => {
    try {
      const params: GenerateRecipesParams = {
        cuisine: selectedCuisine,
        difficulty,
        maxTime,
        servings,
      };
      await generateMutation.mutateAsync(params);
      setHasGenerated(true);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to generate recipes"
      );
    }
  };

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
        AI Recipe Generator
      </Text>
    </Animated.View>
  );

  if (hasGenerated && recipes.length > 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {headerComponent}
        <RecipeList
          recipes={recipes}
          refresh={() => refetch()}
          isLoading={isRecipesLoading}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {headerComponent}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          className="px-4 py-6"
        >
          {/* Header Section */}
          <View className="bg-white rounded-2xl p-6 mb-6 items-center">
            <View className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 justify-center items-center mb-4">
              <Ionicons name="sparkles" size={32} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Generate a Recipe
            </Text>
            <Text className="text-center text-gray-600 text-base">
              Create delicious recipes based on the products in your fridge
            </Text>
          </View>

          {/* Cuisine Selector */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(400)}
            className="bg-white rounded-2xl p-6 mb-4"
          >
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Cuisine Type (Optional)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CUISINES.map((cuisine) => (
                <TouchableOpacity
                  key={cuisine}
                  onPress={() => setSelectedCuisine(selectedCuisine === cuisine ? undefined : cuisine)}
                  className={`px-4 py-2 rounded-full ${
                    selectedCuisine === cuisine
                      ? "bg-black"
                      : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      selectedCuisine === cuisine
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Difficulty Selector */}
          <Animated.View
            entering={FadeInUp.delay(250).duration(400)}
            className="bg-white rounded-2xl p-6 mb-4"
          >
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Difficulty (Optional)
            </Text>
            <View className="flex-row gap-3">
              {DIFFICULTIES.map((diff) => (
                <TouchableOpacity
                  key={diff.value}
                  onPress={() => setDifficulty(difficulty === diff.value ? undefined : diff.value)}
                  className={`flex-1 px-4 py-3 rounded-xl ${
                    difficulty === diff.value
                      ? "bg-black"
                      : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-medium text-center ${
                      difficulty === diff.value
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {diff.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Max Time Slider */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(400)}
            className="bg-white rounded-2xl p-6 mb-4"
          >
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Max Preparation Time
            </Text>
            <View className="flex-row items-center justify-between mb-2">
              <TouchableOpacity
                onPress={() => setMaxTime(Math.max(15, maxTime - 15))}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="remove" size={20} color="#374151" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-gray-900">
                {maxTime} min
              </Text>
              <TouchableOpacity
                onPress={() => setMaxTime(Math.min(180, maxTime + 15))}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="add" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2 mt-2">
              {[15, 30, 45, 60, 90, 120].map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => setMaxTime(time)}
                  className={`px-3 py-2 rounded-lg ${
                    maxTime === time ? "bg-black" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      maxTime === time ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {time}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Servings Selector */}
          <Animated.View
            entering={FadeInUp.delay(350).duration(400)}
            className="bg-white rounded-2xl p-6 mb-4"
          >
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Number of Servings
            </Text>
            <View className="flex-row items-center justify-center gap-4">
              <TouchableOpacity
                onPress={() => setServings(Math.max(1, servings - 1))}
                className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="remove" size={24} color="#374151" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-gray-900 min-w-12 text-center">
                {servings}
              </Text>
              <TouchableOpacity
                onPress={() => setServings(Math.min(12, servings + 1))}
                className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="add" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Generate Button */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(400)}
            className="bg-white rounded-2xl p-6"
          >
            <TouchableOpacity
              onPress={handleGenerateRecipe}
              disabled={generateMutation.isPending}
              className="bg-black py-4 rounded-xl items-center"
            >
              {generateMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="sparkles" size={20} color="white" />
                  <Text className="text-white font-semibold text-lg">
                    Generate Recipes
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
