import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  fetchAchievementsProfile,
  fetchUserBadges,
  fetchAllBadges,
  fetchActiveChallenges,
  fetchCompletedChallenges,
  fetchLeaderboard,
} from "@/lib/api/fetch-achievements";
import { showBadgeNotification } from "@/lib/notifications";

export function useAchievementsProfile() {
  return useQuery({
    queryKey: ["gamification", "profile"],
    queryFn: fetchAchievementsProfile,
  });
}

export function useUserBadges() {
  const previousBadgeCount = useRef<number | null>(null);
  
  const query = useQuery({
    queryKey: ["achievements", "badges"],
    queryFn: fetchUserBadges,
  });

  // Watch for new badges and show notification
  useEffect(() => {
    if (query.data) {
      // Only check for new badges if we have a previous count (not on initial load)
      if (previousBadgeCount.current !== null && query.data.length > previousBadgeCount.current) {
        // New badge(s) earned
        const newBadges = query.data.slice(previousBadgeCount.current);
        newBadges.forEach((userBadge) => {
          showBadgeNotification(userBadge.badge.name, userBadge.badge.icon);
        });
      }
      previousBadgeCount.current = query.data.length;
    }
  }, [query.data]);

  return query;
}

export function useAllBadges() {
  return useQuery({
    queryKey: ["achievements", "badges", "all"],
    queryFn: fetchAllBadges,
  });
}

export function useActiveChallenges() {
  return useQuery({
    queryKey: ["achievements", "challenges", "active"],
    queryFn: fetchActiveChallenges,
  });
}

export function useCompletedChallenges() {
  return useQuery({
    queryKey: ["achievements", "challenges", "completed"],
    queryFn: fetchCompletedChallenges,
  });
}

export function useLeaderboard(limit: number = 10) {
  return useQuery({
    queryKey: ["achievements", "leaderboard", limit],
    queryFn: () => fetchLeaderboard(limit),
  });
}
