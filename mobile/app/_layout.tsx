import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
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

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isPending, isRefetching, data: session } = authClient.useSession();
  const isLoading = isPending || isRefetching;
  const isLoggedIn = !!session;
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)"

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
        options={{ presentation: "modal", title: "Scan a barcode" }}
      />
      <Stack.Screen
        name="product/create"
        options={{ presentation: "modal", title: "Add product" }}
      />
      <Stack.Screen
        name="product/[id]"
        options={{ title: "Product details", headerShown: false }}
      />

      <Stack.Screen
        name="receipt/scan"
        options={{ presentation: "modal", title: "Scan a ticket" }}
      />
      <Stack.Screen
        name="receipt/confirm"
        options={{ presentation: "modal", title: "Confirm products" }}
      />

      <Stack.Screen
        name="recipe/generate"
        options={{ presentation: "modal", title: "Generate recipes" }}
      />
      <Stack.Screen
        name="recipe/[id]"
        options={{ title: "Recipe details", headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
