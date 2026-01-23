import { useEffect, useRef } from "react";
import {
  useRouter,
  useSegments,
  useRootNavigationState,
  SplashScreen,
} from "expo-router";
import { authClient } from "@/lib/auth-client";

/**
 * Hook que gère les redirections d'authentification
 * - Redirige vers l'app si l'utilisateur est authentifié ET essaie d'accéder aux pages d'auth
 * - Masque le splash screen après la première vérification
 */
export function useAuthRedirect() {
  const { isPending, isRefetching, data: session } = authClient.useSession();
  const isLoading = isPending || isRefetching;
  const isLoggedIn = session?.user != null;
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const splashHiddenRef = useRef(false);

  // Effet principal: gère les redirections d'authentification
  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const inAuth = segments[0] === "(auth)";

    // Si l'utilisateur est authentifié ET est sur une page d'auth, redirige vers l'app
    if (isLoggedIn && inAuth) {
      router.replace("/(tabs)");
      return;
    } else if (!isLoggedIn && !inAuth) {
      // Si l'utilisateur n'est pas authentifié ET n'est pas sur une page d'auth, redirige vers l'auth
      router.replace("/(auth)");
      return;
    }

    // Masque le splash screen une fois que nous avons déterminé la route
    if (!splashHiddenRef.current) {
      try {
        SplashScreen.hideAsync();
        splashHiddenRef.current = true;
      } catch (error) {
        console.warn("Failed to hide splash screen:", error);
      }
    }
  }, [isLoggedIn, segments, isLoading, navigationState?.key, router]);

  return {
    isLoading,
    isLoggedIn,
    session,
  };
}
