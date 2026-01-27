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

export interface ChallengeGoal {
  type: string;
  target: number;
}

export interface ChallengeReward {
  points: number;
  badge?: string | null;
}

export interface ChallengeProgress {
  current: number;
}

export interface Challenge {
  id: string;
  type: "monthly" | "weekly";
  title: string;
  description: string;
  goal: ChallengeGoal;
  reward: ChallengeReward;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface UserChallenge {
  id: string;
  progress: ChallengeProgress;
  status: "active" | "completed" | "expired";
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeWithProgress extends Challenge {
  userProgress: UserChallenge;
}

export interface CompletedChallenge {
  id: string;
  progress: ChallengeProgress;
  completedAt: string | null;
  challenge: {
    id: string;
    type: "monthly" | "weekly";
    title: string;
    description: string;
    reward: ChallengeReward;
  };
}

export interface AchievementsProfile {
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

export const fetchAchievementsProfile = async (): Promise<AchievementsProfile> => {
  const session = await authClient.getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/achievements/profile`, {
    headers: {
      Cookie: `better-auth.session_token=${session.session.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch achievements profile");
  }

  const data = await response.json();
  if (!data || !data.profile) {
    throw new Error("Invalid response: profile data missing");
  }
  return data.profile;
};

export const fetchUserBadges = async (): Promise<UserBadge[]> => {
  const session = await authClient.getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/achievements/badges`, {
    headers: {
      Cookie: `better-auth.session_token=${session.session.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user badges");
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.badges)) {
    throw new Error("Invalid response: badges data missing or invalid");
  }
  return data.badges;
};

export const fetchAllBadges = async (): Promise<Badge[]> => {
  const response = await fetch(`${API_BASE_URL}/achievements/badges/all`);

  if (!response.ok) {
    throw new Error("Failed to fetch all badges");
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.badges)) {
    throw new Error("Invalid response: badges data missing or invalid");
  }
  return data.badges;
};

export const fetchActiveChallenges = async (): Promise<ChallengeWithProgress[]> => {
  const session = await authClient.getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/achievements/challenges/active`, {
    headers: {
      Cookie: `better-auth.session_token=${session.session.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch active challenges");
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.challenges)) {
    throw new Error("Invalid response: challenges data missing or invalid");
  }
  return data.challenges;
};

export const fetchCompletedChallenges = async (): Promise<CompletedChallenge[]> => {
  const session = await authClient.getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/achievements/challenges/completed`, {
    headers: {
      Cookie: `better-auth.session_token=${session.session.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch completed challenges");
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.challenges)) {
    throw new Error("Invalid response: challenges data missing or invalid");
  }
  return data.challenges;
};

export const fetchLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  const response = await fetch(`${API_BASE_URL}/achievements/leaderboard?limit=${limit}`);

  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard");
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.leaderboard)) {
    throw new Error("Invalid response: leaderboard data missing or invalid");
  }
  return data.leaderboard;
};
