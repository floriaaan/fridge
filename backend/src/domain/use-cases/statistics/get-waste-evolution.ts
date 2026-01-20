import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import type { WasteEvolution, WasteEvolutionPoint } from "@/domain/entity/statistics";
import { eq, and, gte, lte } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";

export const getWasteEvolution = async ({
  user,
  status,
  query,
}: Context & {
  user: User;
  query: { months?: string };
}): Promise<FridgeResponse<WasteEvolution>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const months = parseInt(query.months || "6", 10);
  if (months < 1 || months > 24) {
    status(400);
    return { error: "Months must be between 1 and 24" };
  }

  try {
    const points: WasteEvolutionPoint[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

      // Get products created in this month
      const monthProducts = await db
        .select()
        .from(product)
        .where(
          and(
            eq(product.userId, user.id),
            gte(product.createdAt, monthStart),
            lte(product.createdAt, monthEnd)
          )
        );

      const consumed = monthProducts.filter((p) => p.consumedAt !== null).length;
      const discarded = monthProducts.filter((p) => p.discardedAt !== null).length;
      const total = consumed + discarded;
      const wasteRate = total > 0 ? Math.round((discarded / total) * 100 * 10) / 10 : 0;

      points.push({
        date: monthStart.toISOString().slice(0, 7), // YYYY-MM format
        wasteRate,
        consumedProducts: consumed,
        discardedProducts: discarded,
        totalProducts: monthProducts.length,
      });
    }

    // Calculate trend (comparing last month to average of previous months)
    const wasteRates = points.map((p) => p.wasteRate);
    const averageWasteRate =
      wasteRates.length > 0
        ? Math.round((wasteRates.reduce((a, b) => a + b, 0) / wasteRates.length) * 10) / 10
        : 0;

    let trend: "up" | "down" | "stable" = "stable";
    if (points.length >= 2) {
      const lastPoint = points[points.length - 1];
      const lastMonth = lastPoint?.wasteRate ?? 0;
      const previousMonths = points.slice(0, -1);
      const previousAvg =
        previousMonths.length > 0
          ? previousMonths.reduce((a, b) => a + b.wasteRate, 0) / previousMonths.length
          : 0;

      const diff = lastMonth - previousAvg;
      if (diff > 2) {
        trend = "up";
      } else if (diff < -2) {
        trend = "down";
      }
    }

    return {
      success: true,
      data: {
        points,
        trend,
        averageWasteRate,
      },
    };
  } catch (error) {
    status(500);
    return {
      error: "Failed to fetch waste evolution",
      message: (error as Error).message,
    };
  }
};
