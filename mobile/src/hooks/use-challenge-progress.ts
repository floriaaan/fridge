import { useRef, useCallback } from "react";
import { ChallengeSnackbarRef } from "@/components/ui/challenge-snackbar";
import { showChallengeProgressNotification, showChallengeCompletedNotification } from "@/lib/notifications";

// Constants for challenge progress notifications
const PROGRESS_NOTIFICATION_INTERVAL = 25; // Show notification every 25%
const PROGRESS_NOTIFICATION_THRESHOLD = 5; // Threshold for rounding
const DEFAULT_REWARD_POINTS = 100;

/**
 * Hook to show challenge progress updates
 * Returns a function to show the snackbar and send notifications
 */
export function useChallengeProgress() {
  const snackbarRef = useRef<ChallengeSnackbarRef>(null);

  const showProgress = useCallback(
    (title: string, progress: number, target: number, rewardPoints: number = DEFAULT_REWARD_POINTS, silent: boolean = false) => {
      // Show top snackbar
      snackbarRef.current?.show(title, progress, target);

      // Send notification if not silent
      if (!silent) {
        if (progress >= target) {
          // Challenge completed
          showChallengeCompletedNotification(title, rewardPoints);
        } else {
          // Show progress notification every 25% or so
          const percentage = (progress / target) * 100;
          if (percentage % PROGRESS_NOTIFICATION_INTERVAL < PROGRESS_NOTIFICATION_THRESHOLD) {
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
