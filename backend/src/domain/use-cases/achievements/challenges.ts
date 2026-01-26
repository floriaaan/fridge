import { db } from "@/infrastructure/database";
import {
  challenge,
  userChallenge,
  userGamificationProfile,
} from "@/infrastructure/database/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { awardPoints } from "./profile";
import type { ChallengeGoal, ChallengeReward, ChallengeProgress } from "@/domain/entity/achievements";
import { MONTHLY_CHALLENGES } from "@/config/achievements/challenge-definitions";

/**
 * Initialize monthly challenges
 * This should be called via a cron job at the start of each month
 */
export const initializeChallenges = async () => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Check if challenges already exist for this month
    const [existing] = await db
      .select()
      .from(challenge)
      .where(
        and(
          eq(challenge.type, "monthly"),
          gte(challenge.startDate, monthStart),
          lte(challenge.endDate, monthEnd)
        )
      );

    if (existing) {
      return; // Challenges already exist
    }

    // Create challenges from definitions
    for (const challengeDef of MONTHLY_CHALLENGES) {
      await db.insert(challenge).values({
        type: challengeDef.type,
        title: challengeDef.title,
        description: challengeDef.description,
        goal: challengeDef.goal,
        reward: challengeDef.reward,
        startDate: monthStart,
        endDate: monthEnd,
      });
    }
  } catch (error) {
    console.error("Error initializing challenges:", error);
  }
};

/**
 * Get active challenges for user
 */
export const getActiveChallenges = async ({
  user,
  status,
}: Context & { user?: User }) => {
  if (!user?.id) {
    status(401);
    return { error: "Unauthorized" };
  }

  try {
    const now = new Date();

    // Get active challenges
    const activeChallenges = await db
      .select()
      .from(challenge)
      .where(and(lte(challenge.startDate, now), gte(challenge.endDate, now)));

    // Get user's progress for each challenge
    const challengesWithProgress = await Promise.all(
      activeChallenges.map(async (ch) => {
        const [userCh] = await db
          .select()
          .from(userChallenge)
          .where(
            and(
              eq(userChallenge.userId, user.id),
              eq(userChallenge.challengeId, ch.id)
            )
          );

        // If user doesn't have this challenge yet, create it
        if (!userCh) {
          const [newUserChallenge] = await db
            .insert(userChallenge)
            .values({
              userId: user.id,
              challengeId: ch.id,
              progress: { current: 0 },
              status: "active",
            })
            .returning();

          return {
            ...ch,
            userProgress: newUserChallenge,
          };
        }

        return {
          ...ch,
          userProgress: userCh,
        };
      })
    );

    return { success: true, data: { challenges: challengesWithProgress } };
  } catch (error) {
    console.error("Error getting active challenges:", error);
    status(500);
    return { error: "Failed to get challenges" };
  }
};

/**
 * Update challenge progress
 */
export const updateChallengeProgress = async (
  userId: string,
  challengeType: string,
  progressValue: number
) => {
  try {
    const now = new Date();

    // Get active challenges of this type
    const activeChallenges = await db
      .select()
      .from(challenge)
      .where(
        and(
          lte(challenge.startDate, now),
          gte(challenge.endDate, now),
          sql`${challenge.goal}->>'type' = ${challengeType}`
        )
      );

    for (const ch of activeChallenges) {
      // Get or create user challenge
      let [userCh] = await db
        .select()
        .from(userChallenge)
        .where(
          and(
            eq(userChallenge.userId, userId),
            eq(userChallenge.challengeId, ch.id),
            eq(userChallenge.status, "active")
          )
        );

      if (!userCh) {
        [userCh] = await db
          .insert(userChallenge)
          .values({
            userId,
            challengeId: ch.id,
            progress: { current: 0 },
            status: "active",
          })
          .returning();
      }

      if (!userCh) continue; // Skip if still undefined

      // Update progress
      const currentProgress = (userCh.progress as ChallengeProgress).current || 0;
      const newProgress = currentProgress + progressValue;
      const target = (ch.goal as ChallengeGoal).target;

      let newStatus = userCh.status;
      let completedAt = userCh.completedAt;

      // Check if challenge is completed
      if (newProgress >= target && userCh.status === "active") {
        newStatus = "completed";
        completedAt = new Date();

        // Award reward points
        const rewardPoints = (ch.reward as ChallengeReward).points || 0;
        await awardPoints(userId, rewardPoints);

        // Update challenges completed count
        await db
          .update(userGamificationProfile)
          .set({
            totalChallengesCompleted: sql`${userGamificationProfile.totalChallengesCompleted} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(userGamificationProfile.userId, userId));
      }

      await db
        .update(userChallenge)
        .set({
          progress: { current: newProgress },
          status: newStatus,
          completedAt,
          updatedAt: new Date(),
        })
        .where(eq(userChallenge.id, userCh.id));
    }
  } catch (error) {
    console.error("Error updating challenge progress:", error);
  }
};

/**
 * Get completed challenges for user
 */
export const getCompletedChallenges = async ({
  user,
  status,
}: Context & { user?: User }) => {
  if (!user?.id) {
    status(401);
    return { error: "Unauthorized" };
  }

  try {
    const completedChallenges = await db
      .select({
        id: userChallenge.id,
        progress: userChallenge.progress,
        completedAt: userChallenge.completedAt,
        challenge: {
          id: challenge.id,
          type: challenge.type,
          title: challenge.title,
          description: challenge.description,
          reward: challenge.reward,
        },
      })
      .from(userChallenge)
      .innerJoin(challenge, eq(userChallenge.challengeId, challenge.id))
      .where(
        and(
          eq(userChallenge.userId, user.id),
          eq(userChallenge.status, "completed")
        )
      )
      .orderBy(sql`${userChallenge.completedAt} DESC`);

    return { success: true, data: { challenges: completedChallenges } };
  } catch (error) {
    console.error("Error getting completed challenges:", error);
    status(500);
    return { error: "Failed to get completed challenges" };
  }
};
