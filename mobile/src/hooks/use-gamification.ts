import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  fetchGamificationProfile,
  fetchUserBadges,
  fetchAllBadges,
  fetchActiveChallenges,
  fetchCompletedChallenges,
  fetchLeaderboard,
} from "@/lib/api/fetch-gamification";
import { showBadgeNotification } from "@/lib/notifications";

export function useGamificationProfile() {
  return useQuery({
    queryKey: ["gamification", "profile"],
    queryFn: fetchGamificationProfile,
  });
}

export function useUserBadges() {
  const previousBadgeCount = useRef<number>(0);
  
  const query = useQuery({
    queryKey: ["gamification", "badges"],
    queryFn: fetchUserBadges,
  });

  // Watch for new badges and show notification
  useEffect(() => {
    if (query.data && query.data.length > previousBadgeCount.current) {
      // New badge(s) earned
      const newBadges = query.data.slice(previousBadgeCount.current);
      newBadges.forEach((userBadge) => {
        showBadgeNotification(userBadge.badge.name, userBadge.badge.icon);
      });
    }
    if (query.data) {
      previousBadgeCount.current = query.data.length;
    }
  }, [query.data]);

  return query;
}

export function useAllBadges() {
  return useQuery({
    queryKey: ["gamification", "badges", "all"],
    queryFn: fetchAllBadges,
  });
}

export function useActiveChallenges() {
  return useQuery({
    queryKey: ["gamification", "challenges", "active"],
    queryFn: fetchActiveChallenges,
  });
}

export function useCompletedChallenges() {
  return useQuery({
    queryKey: ["gamification", "challenges", "completed"],
    queryFn: fetchCompletedChallenges,
  });
}

export function useLeaderboard(limit: number = 10) {
  return useQuery({
    queryKey: ["gamification", "leaderboard", limit],
    queryFn: () => fetchLeaderboard(limit),
  });
}
