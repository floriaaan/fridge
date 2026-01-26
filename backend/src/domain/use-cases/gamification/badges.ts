import { db } from "@/infrastructure/database";
import {
  badge,
  userBadge,
  userGamificationProfile,
  product,
} from "@/infrastructure/database/schema";
import { eq, and, sql, count, gte, isNotNull } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { awardPoints, calculateEcoScore } from "./profile";

/**
 * Initialize default badges in the database
 */
export const initializeBadges = async () => {
  try {
    const badges = [
      {
        type: "first_product",
        name: "First Steps",
        description: "Add your first product",
        icon: "🎯",
        criteria: { minProducts: 1 },
      },
      {
        type: "first_week",
        name: "Week Warrior",
        description: "Use the app for 7 consecutive days",
        icon: "🔥",
        criteria: { minStreak: 7 },
      },
      {
        type: "zero_waste_week",
        name: "Zero Waste Hero",
        description: "Zero waste for a whole week",
        icon: "♻️",
        criteria: { zeroWasteDays: 7 },
      },
      {
        type: "eco_warrior",
        name: "Eco Warrior",
        description: "Achieve an eco score of 80 or higher",
        icon: "🌿",
        criteria: { minEcoScore: 80 },
      },
      {
        type: "recipe_master",
        name: "Recipe Master",
        description: "Generate 10 recipes",
        icon: "👨‍🍳",
        criteria: { minRecipes: 10 },
      },
      {
        type: "scanner_pro",
        name: "Scanner Pro",
        description: "Scan 20 receipts or products",
        icon: "📸",
        criteria: { minScans: 20 },
      },
      {
        type: "money_saver",
        name: "Money Saver",
        description: "Save €50 by not wasting food",
        icon: "💰",
        criteria: { minMoneySaved: 50 },
      },
      {
        type: "consistent_user",
        name: "Consistency King",
        description: "Use the app for 30 days straight",
        icon: "👑",
        criteria: { minStreak: 30 },
      },
    ];

    for (const badgeData of badges) {
      // Check if badge already exists
      const [existing] = await db
        .select()
        .from(badge)
        .where(eq(badge.type, badgeData.type));

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
export const getUserBadges = async ({ user }: Context & { user?: User }) => {
  if (!user?.id) {
    return FridgeResponse.Unauthorized();
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

    return FridgeResponse.Ok({ badges });
  } catch (error) {
    console.error("Error getting user badges:", error);
    return FridgeResponse.InternalError("Failed to get user badges");
  }
};

/**
 * Get all available badges
 */
export const getAllBadges = async () => {
  try {
    const allBadges = await db.select().from(badge);
    return FridgeResponse.Ok({ badges: allBadges });
  } catch (error) {
    console.error("Error getting all badges:", error);
    return FridgeResponse.InternalError("Failed to get badges");
  }
};
