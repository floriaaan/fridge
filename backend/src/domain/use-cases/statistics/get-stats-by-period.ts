import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import type { PeriodStats, CategoryStat } from "@/domain/entity/statistics";
import { eq, and, gte, lte } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import {
  getCO2PerKg,
  getAveragePricePerKg,
  getMotivationMessage,
} from "@/config/co2-conversion";

type Period = "daily" | "weekly" | "monthly" | "yearly";

/**
 * Get period start and end dates
 */
function getPeriodBounds(period: Period, date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date);
  const end = new Date(date);

  switch (period) {
    case "daily":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "weekly":
      const dayOfWeek = start.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday is first day
      start.setDate(start.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case "monthly":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case "yearly":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

/**
 * Calculate CO2 impact for products
 */
function calculateCO2Impact(
  products: Array<{ category: string; quantity: number; unit: string }>
): number {
  return products.reduce((total, p) => {
    let quantityInKg = p.quantity;
    if (p.unit === "g") {
      quantityInKg = p.quantity / 1000;
    } else if (p.unit === "ml") {
      quantityInKg = p.quantity / 1000;
    } else if (p.unit === "piece") {
      quantityInKg = p.quantity * 0.2;
    }

    const co2PerKg = getCO2PerKg(p.category);
    return total + quantityInKg * co2PerKg;
  }, 0);
}

/**
 * Calculate savings/waste for products
 */
function calculateMonetary(
  products: Array<{
    category: string;
    quantity: number;
    unit: string;
    price: string | null;
  }>
): number {
  return products.reduce((total, p) => {
    if (p.price) {
      return total + parseFloat(p.price);
    }

    let quantityInKg = p.quantity;
    if (p.unit === "g") {
      quantityInKg = p.quantity / 1000;
    } else if (p.unit === "ml") {
      quantityInKg = p.quantity / 1000;
    } else if (p.unit === "piece") {
      quantityInKg = p.quantity * 0.2;
    }

    const avgPrice = getAveragePricePerKg(p.category);
    return total + quantityInKg * avgPrice;
  }, 0);
}

/**
 * Calculate top categories
 */
function calculateTopCategories(
  products: Array<{ category: string }>,
  limit: number = 5
): CategoryStat[] {
  const categoryCounts = products.reduce(
    (acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const total = products.length || 1;
  return Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100 * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export const getStatsByPeriod = async ({
  user,
  status,
  params,
  query,
}: Context & {
  user: User;
  params: { period: string };
  query: { date?: string };
}): Promise<FridgeResponse<PeriodStats>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const period = params.period as Period;
  if (!["daily", "weekly", "monthly", "yearly"].includes(period)) {
    status(400);
    return { error: "Invalid period. Use: daily, weekly, monthly, or yearly" };
  }

  const date = query.date ? new Date(query.date) : new Date();
  const { start, end } = getPeriodBounds(period, date);

  try {
    // Get products created within the period
    const periodProducts = await db
      .select()
      .from(product)
      .where(
        and(
          eq(product.userId, user.id),
          gte(product.createdAt, start),
          lte(product.createdAt, end)
        )
      );

    const consumedProducts = periodProducts.filter((p) => p.consumedAt !== null);
    const discardedProducts = periodProducts.filter((p) => p.discardedAt !== null);
    const activeProducts = periodProducts.filter(
      (p) => p.consumedAt === null && p.discardedAt === null && p.quantity > 0
    );

    const totalProcessed = consumedProducts.length + discardedProducts.length;
    const wasteRate =
      totalProcessed > 0
        ? Math.round((discardedProducts.length / totalProcessed) * 100 * 10) / 10
        : 0;

    const moneySaved = calculateMonetary(consumedProducts);
    const moneyWasted = calculateMonetary(discardedProducts);
    const co2Avoided = calculateCO2Impact(consumedProducts);
    const topCategories = calculateTopCategories(periodProducts);
    const motivationMessage = getMotivationMessage(wasteRate);

    return {
      success: true,
      data: {
        period,
        periodStart: start,
        periodEnd: end,
        totalProducts: periodProducts.length,
        consumedProducts: consumedProducts.length,
        discardedProducts: discardedProducts.length,
        activeProducts: activeProducts.length,
        wasteRate,
        moneySaved: Math.round(moneySaved * 100) / 100,
        moneyWasted: Math.round(moneyWasted * 100) / 100,
        co2Avoided: Math.round(co2Avoided * 100) / 100,
        topCategories,
        motivationMessage,
      },
    };
  } catch (error) {
    status(500);
    return {
      error: "Failed to fetch period statistics",
      message: (error as Error).message,
    };
  }
};
