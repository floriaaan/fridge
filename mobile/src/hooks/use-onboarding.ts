import { useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { isOnboardingCompleted } from "@/lib/server-config";
import { initializeApiConfig } from "@/lib/api-config";

/**
 * Hook que gère l'état d'onboarding
 * - Vérifie si l'onboarding a été complété
 * - Redirige vers l'onboarding si nécessaire
 */
export function useOnboarding() {
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Vérifie l'état initial de l'onboarding
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

  // Re-vérifie l'état de l'onboarding après chaque navigation
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

  // Redirige vers l'onboarding si c'est nécessaire
  useEffect(() => {
    if (isCheckingOnboarding) return;

    const inOnboarding = segments[0] === "onboarding";
    if (needsOnboarding && !inOnboarding) {
      router.replace("/onboarding");
    }
  }, [isCheckingOnboarding, segments, needsOnboarding, router]);

  return {
    isCheckingOnboarding,
    needsOnboarding,
  };
}
