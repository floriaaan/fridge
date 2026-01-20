import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import type { CategoryStat } from "@/domain/entity/statistics";
import { eq } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";

export const getTopCategories = async ({
  user,
  status,
  query,
}: Context & {
  user: User;
  query: { limit?: string };
}): Promise<FridgeResponse<CategoryStat[]>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const limit = parseInt(query.limit || "10", 10);
  if (limit < 1 || limit > 50) {
    status(400);
    return { error: "Limit must be between 1 and 50" };
  }

  try {
    const allProducts = await db
      .select()
      .from(product)
      .where(eq(product.userId, user.id));

    const categoryCounts = allProducts.reduce(
      (acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const total = allProducts.length || 1;
    const categories: CategoryStat[] = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100 * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    status(500);
    return {
      error: "Failed to fetch top categories",
      message: (error as Error).message,
    };
  }
};
