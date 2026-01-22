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
import { useEffect, useState, useRef } from "react";
import { useColorScheme } from "react-native";
import { useTranslation } from "@/hooks/use-translation";
import { isOnboardingCompleted } from "@/lib/server-config";
import { initializeApiConfig } from "@/lib/api-config";

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
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const splashHiddenRef = useRef(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Initialize API config from stored server config
        await initializeApiConfig();
        
        const completed = await isOnboardingCompleted();
        setNeedsOnboarding(!completed);
      } catch (error) {
        console.error("Error checking onboarding:", error);
        setNeedsOnboarding(true);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  // Re-check onboarding status when navigating away from onboarding
  useEffect(() => {
    const recheckOnboarding = async () => {
      const inOnboarding = segments[0] === "onboarding";
      if (!inOnboarding && needsOnboarding) {
        const completed = await isOnboardingCompleted();
        if (completed) {
          setNeedsOnboarding(false);
        }
      }
    };

    recheckOnboarding();
  }, [segments, needsOnboarding]);

  useEffect(() => {
    if (isCheckingOnboarding || !navigationState?.key || splashHiddenRef.current) return;

    const inOnboarding = segments[0] === "onboarding";

    if (needsOnboarding && !inOnboarding) {
      router.replace("/onboarding");
    }
    
    try {
      SplashScreen.hideAsync();
      splashHiddenRef.current = true;
    } catch (error) {
      console.warn("Failed to hide splash screen:", error);
    }
  }, [isLoggedIn, segments, isLoading, navigationState?.key, router, isCheckingOnboarding, needsOnboarding]);

  return (
    <Stack>
      <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
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
