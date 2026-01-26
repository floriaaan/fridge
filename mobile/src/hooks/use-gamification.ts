import { useQuery } from "@tanstack/react-query";
import {
  fetchGamificationProfile,
  fetchUserBadges,
  fetchAllBadges,
  fetchActiveChallenges,
  fetchCompletedChallenges,
  fetchLeaderboard,
} from "@/lib/api/fetch-gamification";

export function useGamificationProfile() {
  return useQuery({
    queryKey: ["gamification", "profile"],
    queryFn: fetchGamificationProfile,
  });
}

export function useUserBadges() {
  return useQuery({
    queryKey: ["gamification", "badges"],
    queryFn: fetchUserBadges,
  });
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
