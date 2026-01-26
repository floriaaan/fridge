import { useRef, useCallback } from "react";
import { ChallengeSnackbarRef } from "@/components/ui/challenge-snackbar";
import { showChallengeProgressNotification, showChallengeCompletedNotification } from "@/lib/notifications";

/**
 * Hook to show challenge progress updates
 * Returns a function to show the snackbar and send notifications
 */
export function useChallengeProgress() {
  const snackbarRef = useRef<ChallengeSnackbarRef>(null);

  const showProgress = useCallback(
    (title: string, progress: number, target: number, silent: boolean = false) => {
      // Show top snackbar
      snackbarRef.current?.show(title, progress, target);

      // Send notification if not silent
      if (!silent) {
        if (progress >= target) {
          // Challenge completed
          showChallengeCompletedNotification(title, 100); // Default reward
        } else {
          // Show progress notification every 25% or so
          const percentage = (progress / target) * 100;
          if (percentage % 25 < 5) {
            // Roughly every 25% completion
            showChallengeProgressNotification(title, progress, target);
          }
        }
      }
    },
    []
  );

  return { snackbarRef, showProgress };
}
