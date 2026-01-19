import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import type { OverallStats, CategoryStat } from "@/domain/entity/statistics";
import { eq, isNotNull, and, sql } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import {
  getCO2PerKg,
  getAveragePricePerKg,
  getMotivationMessage,
} from "@/config/co2-conversion";

/**
 * Calculate CO2 impact for products based on their category
 * @param products - Array of products with category and quantity
 * @returns Total CO2 in kg
 */
function calculateCO2Impact(
  products: Array<{ category: string; quantity: number; unit: string }>
): number {
  return products.reduce((total, p) => {
    // Convert quantity to kg for calculation
    let quantityInKg = p.quantity;
    if (p.unit === "g") {
      quantityInKg = p.quantity / 1000;
    } else if (p.unit === "ml") {
      quantityInKg = p.quantity / 1000; // Approximate 1ml = 1g for liquids
    } else if (p.unit === "piece") {
      quantityInKg = p.quantity * 0.2; // Average piece weight ~200g
    }

    const co2PerKg = getCO2PerKg(p.category);
    return total + quantityInKg * co2PerKg;
  }, 0);
}

/**
 * Calculate savings for consumed products
 * @param products - Array of consumed products with price and category
 * @returns Total savings in currency
 */
function calculateSavings(
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

    // Use average price if no price provided
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
 * Calculate money wasted on discarded products
 */
function calculateWasted(
  products: Array<{
    category: string;
    quantity: number;
    unit: string;
    price: string | null;
  }>
): number {
  return calculateSavings(products); // Same calculation logic
}

/**
 * Calculate top categories from products
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
  const categories = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100 * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return categories;
}

export const getOverallStats = async ({
  user,
  status,
}: Context & { user: User }): Promise<FridgeResponse<OverallStats>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  try {
    // Get all products for user
    const allProducts = await db
      .select()
      .from(product)
      .where(eq(product.userId, user.id));

    // Separate products by status
    const consumedProducts = allProducts.filter((p) => p.consumedAt !== null);
    const discardedProducts = allProducts.filter((p) => p.discardedAt !== null);
    const activeProducts = allProducts.filter(
      (p) => p.consumedAt === null && p.discardedAt === null && p.quantity > 0
    );

    const totalProcessed = consumedProducts.length + discardedProducts.length;
    const wasteRate =
      totalProcessed > 0
        ? Math.round((discardedProducts.length / totalProcessed) * 100 * 10) /
          10
        : 0;

    // Calculate financial metrics
    const moneySaved = calculateSavings(consumedProducts);
    const moneyWasted = calculateWasted(discardedProducts);

    // Calculate CO2 avoided (products consumed instead of being wasted and replaced)
    const co2Avoided = calculateCO2Impact(consumedProducts);

    // Get top categories from all products
    const topCategories = calculateTopCategories(allProducts);

    const motivationMessage = getMotivationMessage(wasteRate);

    return {
      success: true,
      data: {
        totalProducts: allProducts.length,
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
      error: "Failed to fetch statistics",
      message: (error as Error).message,
    };
  }
};
