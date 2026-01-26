import { API_BASE_URL } from "@/lib/api-config";
import { authClient } from "@/lib/auth-client";

export interface Badge {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  criteria?: Record<string, any>;
  createdAt?: string;
}

export interface UserBadge {
  id: string;
  earnedAt: string;
  badge: Badge;
}

export interface Challenge {
  id: string;
  type: "monthly" | "weekly";
  title: string;
  description: string;
  goal: Record<string, any>;
  reward: Record<string, any>;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface UserChallenge {
  id: string;
  progress: Record<string, any>;
  status: "active" | "completed" | "expired";
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeWithProgress extends Challenge {
  userProgress: UserChallenge;
}

export interface GamificationProfile {
  id: string;
  userId: string;
  level: number;
  points: number;
  streak: number;
  lastActivityDate: string | null;
  totalBadges: number;
  totalChallengesCompleted: number;
  ecoScore: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  level: number;
  points: number;
  ecoScore: string;
}

export const fetchGamificationProfile = async (): Promise<GamificationProfile> => {
  const session = await authClient.getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/gamification/profile`, {
    headers: {
      Cookie: `better-auth.session_token=${session.session.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch gamification profile");
  }

  const data = await response.json();
  return data.profile;
};

export const fetchUserBadges = async (): Promise<UserBadge[]> => {
  const session = await authClient.getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/gamification/badges`, {
    headers: {
      Cookie: `better-auth.session_token=${session.session.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user badges");
  }

  const data = await response.json();
  return data.badges;
};

export const fetchAllBadges = async (): Promise<Badge[]> => {
  const response = await fetch(`${API_BASE_URL}/gamification/badges/all`);

  if (!response.ok) {
    throw new Error("Failed to fetch all badges");
  }

  const data = await response.json();
  return data.badges;
};

export const fetchActiveChallenges = async (): Promise<ChallengeWithProgress[]> => {
  const session = await authClient.getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/gamification/challenges/active`, {
    headers: {
      Cookie: `better-auth.session_token=${session.session.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch active challenges");
  }

  const data = await response.json();
  return data.challenges;
};

export const fetchCompletedChallenges = async (): Promise<any[]> => {
  const session = await authClient.getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/gamification/challenges/completed`, {
    headers: {
      Cookie: `better-auth.session_token=${session.session.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch completed challenges");
  }

  const data = await response.json();
  return data.challenges;
};

export const fetchLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  const response = await fetch(`${API_BASE_URL}/gamification/leaderboard?limit=${limit}`);

  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard");
  }

  const data = await response.json();
  return data.leaderboard;
};
