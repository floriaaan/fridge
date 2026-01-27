import { db } from "@/infrastructure/database";
import {
  badge,
  userBadge,
  userGamificationProfile,
  product,
  badgeTypeEnum,
  type BadgeType,
} from "@/infrastructure/database/schema";
import { eq, and, sql, count, gte, isNotNull } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { awardPoints, calculateEcoScore } from "./profile";
import { DEFAULT_BADGES } from "@/config/achievements/badge-definitions";

/**
 * Initialize default badges in the database
 */
export const initializeBadges = async () => {
  try {
    for (const badgeData of DEFAULT_BADGES) {
      // Check if badge already exists
      const [existing] = await db
        .select()
        .from(badge)
        .where(eq(badge.type, badgeData.type as BadgeType));

      if (!existing) {
        await db.insert(badge).values(badgeData);
      }
    }
  } catch (error) {
    console.error("Error initializing badges:", error);
  }
};

/**
 * Check and award badges to user
 */
export const checkAndAwardBadges = async (userId: string) => {
  try {
    // Get user profile
    const [profile] = await db
      .select()
      .from(userGamificationProfile)
      .where(eq(userGamificationProfile.userId, userId));

    if (!profile) {
      return [];
    }

    // Get user's existing badges
    const existingBadges = await db
      .select({ badgeId: userBadge.badgeId })
      .from(userBadge)
      .where(eq(userBadge.userId, userId));

    const existingBadgeIds = new Set(existingBadges.map((b) => b.badgeId));

    // Get all badges
    const allBadges = await db.select().from(badge);

    const earnedBadges = [];

    for (const badgeData of allBadges) {
      // Skip if user already has this badge
      if (existingBadgeIds.has(badgeData.id)) {
        continue;
      }

      let shouldAward = false;

      // Check criteria
      if (badgeData.type === "first_product") {
        const [result] = await db
          .select({ count: count() })
          .from(product)
          .where(eq(product.userId, userId));
        shouldAward = (result?.count ?? 0) >= 1;
      } else if (badgeData.type === "first_week") {
        shouldAward = profile.streak >= 7;
      } else if (badgeData.type === "zero_waste_week") {
        // Check if user had zero waste for 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const [result] = await db
          .select({ count: count() })
          .from(product)
          .where(
            and(
              eq(product.userId, userId),
              isNotNull(product.discardedAt),
              gte(product.discardedAt, sevenDaysAgo)
            )
          );
        shouldAward = (result?.count ?? 0) === 0;
      } else if (badgeData.type === "eco_warrior") {
        shouldAward = parseFloat(profile.ecoScore) >= 80;
      } else if (badgeData.type === "consistent_user") {
        shouldAward = profile.streak >= 30;
      }

      if (shouldAward) {
        // Award the badge
        await db.insert(userBadge).values({
          userId,
          badgeId: badgeData.id,
        });

        // Update profile badge count
        await db
          .update(userGamificationProfile)
          .set({
            totalBadges: profile.totalBadges + 1,
            updatedAt: new Date(),
          })
          .where(eq(userGamificationProfile.userId, userId));

        // Award points
        await awardPoints(userId, 50); // 50 points per badge

        earnedBadges.push(badgeData);
      }
    }

    return earnedBadges;
  } catch (error) {
    console.error("Error checking and awarding badges:", error);
    return [];
  }
};

/**
 * Get user's earned badges
 */
export const getUserBadges = async ({ user, status }: Context & { user?: User }) => {
  if (!user?.id) {
    status(401);
    return { error: "Unauthorized" };
  }

  try {
    const badges = await db
      .select({
        id: userBadge.id,
        earnedAt: userBadge.earnedAt,
        badge: {
          id: badge.id,
          type: badge.type,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
        },
      })
      .from(userBadge)
      .innerJoin(badge, eq(userBadge.badgeId, badge.id))
      .where(eq(userBadge.userId, user.id))
      .orderBy(sql`${userBadge.earnedAt} DESC`);

    return { success: true, data: { badges } };
  } catch (error) {
    console.error("Error getting user badges:", error);
    status(500);
    return { error: "Failed to get user badges" };
  }
};

/**
 * Get all available badges
 */
export const getAllBadges = async ({ status }: Context) => {
  try {
    const allBadges = await db.select().from(badge);
    return { success: true, data: { badges: allBadges } };
  } catch (error) {
    console.error("Error getting all badges:", error);
    status(500);
    return { error: "Failed to get badges" };
  }
};
