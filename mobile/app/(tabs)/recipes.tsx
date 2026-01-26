import React from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRecipes } from "@/hooks/use-recipes";
import Header from "@/components/ui/header";
import { RecipeList } from "@/components/recipe-list";
import { AnimatedTouchableOpacity } from "@/components/ui/animated-touchable-opacity";
import { useTranslation } from "@/hooks/use-translation";
import { BottomFloatingContainer } from "@/components/ui/bottom-floating-container";

export default function RecipesScreen() {
  const router = useRouter();
  const { data: recipes = [], isLoading, refetch } = useRecipes();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-neutral-50 dark:bg-black"
    >
      <Header title={t("recipe.title")} />

      <RecipeList recipes={recipes} refresh={refetch} isLoading={isLoading} />

       <BottomFloatingContainer style={{ left: 20, right: 20 }}>
         <AnimatedTouchableOpacity
           onPress={() => router.push("/recipe/generate")}
           className="bg-neutral-900 dark:bg-neutral-100 py-4 rounded-full shadow-xl flex-row items-center justify-center"
           activeOpacity={1}
         >
           <Ionicons name="sparkles" size={24} color={isDark ? "#171717" : "white"} />
           <Text className="text-white dark:text-neutral-900 font-semibold text-base ml-2">
             {t("recipe.generate")}
           </Text>
         </AnimatedTouchableOpacity>
       </BottomFloatingContainer>
    </SafeAreaView>
  );
}
