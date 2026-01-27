import { t } from "elysia";

export interface Badge {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  criteria: Record<string, any>;
  createdAt: Date;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  badge?: Badge;
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
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  progress: ChallengeProgress;
  status: "active" | "completed" | "expired";
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  challenge?: Challenge;
}

export interface UserGamificationProfile {
  id: string;
  userId: string;
  level: number;
  points: number;
  streak: number;
  lastActivityDate: Date | null;
  totalBadges: number;
  totalChallengesCompleted: number;
  ecoScore: string;
  createdAt: Date;
  updatedAt: Date;
}

export const badgeSchema = t.Object({
  id: t.String(),
  type: t.String(),
  name: t.String(),
  description: t.String(),
  icon: t.String(),
  criteria: t.Any(),
  createdAt: t.Date(),
});

export const userBadgeSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  badgeId: t.String(),
  earnedAt: t.Date(),
});

export const challengeSchema = t.Object({
  id: t.String(),
  type: t.Union([t.Literal("monthly"), t.Literal("weekly")]),
  title: t.String(),
  description: t.String(),
  goal: t.Any(),
  reward: t.Any(),
  startDate: t.Date(),
  endDate: t.Date(),
  createdAt: t.Date(),
});

export const userChallengeSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  challengeId: t.String(),
  progress: t.Any(),
  status: t.Union([
    t.Literal("active"),
    t.Literal("completed"),
    t.Literal("expired"),
  ]),
  completedAt: t.Union([t.Date(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const gamificationProfileSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  level: t.Number(),
  points: t.Number(),
  streak: t.Number(),
  lastActivityDate: t.Union([t.Date(), t.Null()]),
  totalBadges: t.Number(),
  totalChallengesCompleted: t.Number(),
  ecoScore: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});
