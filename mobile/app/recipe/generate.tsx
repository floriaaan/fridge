import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Alert, useColorScheme } from "react-native";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useGenerateRecipes } from "@/hooks/use-recipes";
import { GenerateRecipesParams } from "@/lib/api/fetch-recipes";
import { useTranslation } from "@/hooks/use-translation";

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

const CUISINE_FLAGS: Record<string, string> = {
  Italian: "🇮🇹",
  French: "🇫🇷",
  Asian: "🥢",
  Mexican: "🇲🇽",
  Indian: "🇮🇳",
  Mediterranean: "🌊",
  American: "🇺🇸",
  Japanese: "🇯🇵",
};

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
] as const;

export default function RecipeGenerate() {
  const router = useRouter();
  const generateMutation = useGenerateRecipes();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
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
      const result = await generateMutation.mutateAsync(params);
      
      // Show success message
      Alert.alert(
        t("common.success"),
        `${result.length} recipe${result.length > 1 ? 's' : ''} generated successfully!`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        t("common.error"),
        error instanceof Error ? error.message : "Failed to generate recipes"
      );
    }
  };
  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-neutral-50 dark:bg-black">
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <Animated.View entering={FadeInUp.delay(100).duration(300)} className="px-4">

          {/* Cuisine Selector */}
          <Animated.View entering={FadeInUp.delay(200).duration(300)} className="mb-4 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="restaurant-outline" size={18} color={isDark ? "#fafafa" : "#111827"} />
              <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 ml-2">
                Cuisine (Optional)
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {CUISINES.map((cuisine) => (
                <TouchableOpacity
                  key={cuisine}
                  onPress={() => setSelectedCuisine(selectedCuisine === cuisine ? undefined : cuisine)}
                  className={`px-4 py-2 rounded-full ${
                    selectedCuisine === cuisine
                      ? "bg-neutral-900 dark:bg-neutral-100"
                      : "bg-neutral-100 dark:bg-neutral-800"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      selectedCuisine === cuisine
                        ? "text-white dark:text-neutral-900"
                        : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {CUISINE_FLAGS[cuisine] ? `${CUISINE_FLAGS[cuisine]} ` : ""}
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Difficulty Selector */}
          <Animated.View entering={FadeInUp.delay(250).duration(300)} className="mb-4 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="flash-outline" size={18} color={isDark ? "#fafafa" : "#111827"} />
              <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 ml-2">
                {t("recipe.selectDifficulty")} (Optional)
              </Text>
            </View>
            <View className="flex-row gap-3">
              {DIFFICULTIES.map((diff) => (
                <TouchableOpacity
                  key={diff.value}
                  onPress={() => setDifficulty(difficulty === diff.value ? undefined : diff.value)}
                  className={`flex-1 px-4 py-3 rounded-xl ${
                    difficulty === diff.value
                      ? "bg-neutral-900 dark:bg-neutral-100"
                      : "bg-neutral-100 dark:bg-neutral-800"
                  }`}
                >
                  <Text
                    className={`font-medium text-center ${
                      difficulty === diff.value
                        ? "text-white dark:text-neutral-900"
                        : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {diff.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Max Time Slider */}
          <Animated.View entering={FadeInUp.delay(300).duration(300)} className="mb-4 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="time-outline" size={18} color={isDark ? "#fafafa" : "#111827"} />
              <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 ml-2">
                {t("recipe.maxTime")}
              </Text>
            </View>
            <View className="mb-2">
              <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-2">{maxTime} {t("recipe.minutes")}</Text>
              <Slider
                value={maxTime}
                onValueChange={(v: number) => setMaxTime(v)}
                minimumValue={15}
                maximumValue={180}
                step={15}
                minimumTrackTintColor={isDark ? "#fafafa" : "#111827"}
                maximumTrackTintColor={isDark ? "#525252" : "#D1D5DB"}
                thumbTintColor={isDark ? "#fafafa" : "#111827"}
              />
            </View>
            
          </Animated.View>

          {/* Servings Selector */}
          <Animated.View entering={FadeInUp.delay(350).duration(300)} className="mb-4 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="people-outline" size={18} color={isDark ? "#fafafa" : "#111827"} />
              <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 ml-2">
                {t("recipe.numberOfPeople")}
              </Text>
            </View>
            <View>
              <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-2">{servings}</Text>
              <Slider
                value={servings}
                onValueChange={(v: number) => setServings(Math.round(v))}
                minimumValue={1}
                maximumValue={12}
                step={1}
                minimumTrackTintColor={isDark ? "#fafafa" : "#111827"}
                maximumTrackTintColor={isDark ? "#525252" : "#D1D5DB"}
                thumbTintColor={isDark ? "#fafafa" : "#111827"}
              />
            </View>
          </Animated.View>

          {/* Generate Button */}
          <Animated.View entering={FadeInUp.delay(400).duration(300)} className="px-4">
            <TouchableOpacity
              onPress={handleGenerateRecipe}
              disabled={generateMutation.isPending}
              className="bg-neutral-900 dark:bg-neutral-100 py-4 rounded-xl items-center"
            >
              {generateMutation.isPending ? (
                <ActivityIndicator color={isDark ? "#171717" : "white"} />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="sparkles" size={20} color={isDark ? "#171717" : "white"} />
                  <Text className="text-white dark:text-neutral-900 font-semibold text-lg">
                    {t("recipe.generateWithAI")}
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
