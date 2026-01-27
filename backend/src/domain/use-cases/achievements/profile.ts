import { db } from "@/infrastructure/database";
import {
  userGamificationProfile,
  product,
  userBadge,
  userChallenge,
} from "@/infrastructure/database/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";

/**
 * Get or create user gamification profile
 */
export const getUserProfile = async ({ user, status }: Context & { user?: User }) => {
  if (!user?.id) {
    status(401);
    return { error: "Unauthorized" };
  }

  try {
    // Try to get existing profile
    let [profile] = await db
      .select()
      .from(userGamificationProfile)
      .where(eq(userGamificationProfile.userId, user.id));

    // If no profile exists, create one
    if (!profile) {
      [profile] = await db
        .insert(userGamificationProfile)
        .values({
          userId: user.id,
          level: 1,
          points: 0,
          streak: 0,
          totalBadges: 0,
          totalChallengesCompleted: 0,
          ecoScore: "0",
        })
        .returning();
    }

    return { success: true, data: { profile } };
  } catch (error) {
    console.error("Error getting user profile:", error);
    status(500);
    return { error: "Failed to get user gamification profile" };
  }
};

/**
 * Update user activity and streak
 */
export const updateUserActivity = async (userId: string) => {
  try {
    const [profile] = await db
      .select()
      .from(userGamificationProfile)
      .where(eq(userGamificationProfile.userId, userId));

    if (!profile) {
      // Create profile if it doesn't exist
      await db.insert(userGamificationProfile).values({
        userId,
        level: 1,
        points: 0,
        streak: 1,
        lastActivityDate: new Date(),
        totalBadges: 0,
        totalChallengesCompleted: 0,
        ecoScore: "0",
      });
      return;
    }

    const now = new Date();
    const lastActivity = profile.lastActivityDate;
    let newStreak = profile.streak;

    if (lastActivity) {
      const daysSinceLastActivity = Math.floor(
        (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastActivity === 1) {
        // Consecutive day, increment streak
        newStreak = profile.streak + 1;
      } else if (daysSinceLastActivity > 1) {
        // Missed days, reset streak
        newStreak = 1;
      }
      // If same day, keep streak as is
    } else {
      newStreak = 1;
    }

    await db
      .update(userGamificationProfile)
      .set({
        lastActivityDate: now,
        streak: newStreak,
        updatedAt: now,
      })
      .where(eq(userGamificationProfile.userId, userId));
  } catch (error) {
    console.error("Error updating user activity:", error);
  }
};

/**
 * Award points to user
 */
export const awardPoints = async (userId: string, points: number) => {
  try {
    const [profile] = await db
      .select()
      .from(userGamificationProfile)
      .where(eq(userGamificationProfile.userId, userId));

    if (!profile) {
      return;
    }

    const newPoints = profile.points + points;
    const newLevel = Math.floor(newPoints / 100) + 1; // Level up every 100 points

    await db
      .update(userGamificationProfile)
      .set({
        points: newPoints,
        level: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(userGamificationProfile.userId, userId));
  } catch (error) {
    console.error("Error awarding points:", error);
  }
};

/**
 * Calculate and update eco score
 */
export const calculateEcoScore = async (userId: string) => {
  try {
    // Get all user products
    const products = await db
      .select()
      .from(product)
      .where(eq(product.userId, userId));

    const consumed = products.filter((p) => p.consumedAt).length;
    const discarded = products.filter((p) => p.discardedAt).length;
    const total = consumed + discarded;

    if (total === 0) {
      return;
    }

    // Calculate eco score based on waste rate (lower is better)
    const wasteRate = discarded / total;
    const ecoScore = Math.max(0, (1 - wasteRate) * 100);

    await db
      .update(userGamificationProfile)
      .set({
        ecoScore: ecoScore.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(userGamificationProfile.userId, userId));
  } catch (error) {
    console.error("Error calculating eco score:", error);
  }
};

/**
 * Get leaderboard (top users by points)
 */
export const getLeaderboard = async ({
  query,
  status,
}: Context & { query: { limit?: string } }) => {
  try {
    const limit = parseInt(query.limit || "10");

    const leaderboard = await db
      .select({
        userId: userGamificationProfile.userId,
        level: userGamificationProfile.level,
        points: userGamificationProfile.points,
        ecoScore: userGamificationProfile.ecoScore,
      })
      .from(userGamificationProfile)
      .orderBy(sql`${userGamificationProfile.points} DESC`)
      .limit(limit);

    return { success: true, data: { leaderboard } };
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    status(500);
    return { error: "Failed to get leaderboard" };
  }
};
