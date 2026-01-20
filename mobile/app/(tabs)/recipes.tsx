import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRecipes } from "@/hooks/use-recipes";
import Header from "@/components/ui/header";
import { RecipeList } from "@/components/recipe-list";
import { useTranslation } from "@/hooks/use-translation";

export default function RecipesScreen() {
  const router = useRouter();
  const { data: recipes = [], isLoading, refetch } = useRecipes();
  const { t } = useTranslation();

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
    >
      <Header title={t("recipe.title")} />

      <RecipeList recipes={recipes} refresh={refetch} isLoading={isLoading} />

      <View className="absolute bottom-5 left-5 right-5">
        <TouchableOpacity
          onPress={() => router.push("/recipe/generate")}
          className="bg-neutral-900 dark:bg-neutral-100 py-4 rounded-xl shadow-xl flex-row items-center justify-center"
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={24} color="white" className="dark:hidden" />
          <Ionicons name="sparkles" size={24} color="black" className="hidden dark:flex" />
          <Text className="text-white dark:text-neutral-900 font-semibold text-base ml-2">
            {t("recipe.generate")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
