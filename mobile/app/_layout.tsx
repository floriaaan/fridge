import {
  DefaultTheme,
  DarkTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  DefaultTheme,
  DarkTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import "react-native-reanimated";
import "../assets/global.css";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useOnboarding } from "@/hooks/use-onboarding";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

/**
 * Composant principal qui gère la navigation en fonction de l'état d'authentification
 * et d'onboarding de l'utilisateur
 */
function RootLayoutNav() {
  const { t } = useTranslation();
  useAuthRedirect();
  useOnboarding();

  return (
    <Stack>
      <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {/* Product Routes */}
      <Stack.Screen
        name="product/scan"
        options={{ presentation: "modal", title: t("product.scanBarcode") }}
      />
      <Stack.Screen
        name="product/create"
        options={{ presentation: "modal", title: t("product.addProduct") }}
      />
      <Stack.Screen
        name="product/[id]"
        options={{ title: t("product.productDetails"), headerShown: false }}
      />

      {/* Receipt Routes */}
      <Stack.Screen
        name="receipt/scan"
        options={{ presentation: "modal", title: t("receipt.scanTicket") }}
      />
      <Stack.Screen
        name="receipt/confirm"
        options={{
          presentation: "modal",
          title: t("receipt.confirmProducts"),
        }}
      />

      {/* Fridge Scan Routes */}
      <Stack.Screen
        name="fridge-scan/scan"
        options={{ presentation: "modal", title: t("fridgeScan.title") }}
      />
      <Stack.Screen
        name="fridge-scan/confirm"
        options={{
          presentation: "modal",
          title: t("fridgeScan.selectProducts"),
        }}
      />

      {/* Recipe Routes */}
      <Stack.Screen
        name="recipe/generate"
        options={{ presentation: "modal", title: t("recipe.generate") }}
      />
      <Stack.Screen
        name="recipe/[id]"
        options={{ title: t("recipe.recipeDetails"), headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
