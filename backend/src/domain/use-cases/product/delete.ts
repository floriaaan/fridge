import { Context, t } from "elysia";
import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import { and, eq, inArray } from "drizzle-orm";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";

export const deleteProductSchema = t.Array(
  t.Object({
    id: t.String(),
  }),
);

export const deleteProducts = async ({
  user,
  body: rawBody,
  status,
}: Context & { user: User }): Promise<FridgeResponse<{ count: number }>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }
  const body = rawBody as { id: string }[];

  try {
    const productIds = body.map((p) => p.id);

    // Delete products and verify they belong to the user
    const result = await db
      .delete(product)
      .where(and(eq(product.userId, user.id), inArray(product.id, productIds)))
      .returning();

    return {
      success: true,
      data: { count: result.length },
    };
  } catch (error) {
    console.error("Error deleting products:", error);
    status(500);
    return {
      error: "Failed to delete products",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
