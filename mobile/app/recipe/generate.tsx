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

export default function RecipeGenerate() {
  const router = useRouter();
  const generateMutation = useGenerateRecipes();
  const {
    data: recipes = [],
    isLoading: isRecipesLoading,
    refetch,
  } = useRecipes();
  const [hasGenerated, setHasGenerated] = React.useState(false);

  const handleGenerateRecipe = async () => {
    try {
      await generateMutation.mutateAsync();
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

          {/* Coming Soon Section */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(400)}
            className="bg-white rounded-2xl p-6"
          >
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Coming Soon!
            </Text>
            <Text className="text-gray-600 text-base leading-6 mb-6">
              This feature will analyze the products currently in your fridge
              and suggest recipes you can make. Check back soon!
            </Text>

            <TouchableOpacity
              onPress={handleGenerateRecipe}
              disabled={generateMutation.isPending}
              className="bg-black py-3 rounded-xl items-center"
            >
              {generateMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Generate Recipes
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
