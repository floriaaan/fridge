import {
  DefaultTheme,
  DarkTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SplashScreen,
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../assets/global.css";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useTranslation } from "@/hooks/use-translation";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isPending, isRefetching, data: session } = authClient.useSession();
  const isLoading = isPending || isRefetching;
  const isLoggedIn = session?.user != null;
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { t } = useTranslation();

  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    // if (isLoggedIn && inAuthGroup) {
    //   router.replace("/(tabs)");
    // } else if (!isLoggedIn && !inAuthGroup) {
    //   router.replace("/(auth)");
    // }
    SplashScreen.hideAsync();
  }, [isLoggedIn, segments, isLoading, navigationState?.key, router]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
