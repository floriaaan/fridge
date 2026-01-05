import { Context, t } from "elysia";
import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import type { Product } from "@/domain/entity/product";
import { and, eq, inArray, sql } from "drizzle-orm";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";

export const updateProductSchema = t.Array(t.Object({
  id: t.String(),
  name: t.Optional(t.String()),
  quantity: t.Optional(t.Integer()),
}));

export const updateProducts = async ({
  user,
  body: rawBody,
  status,
}: Context & { user: User }): Promise<FridgeResponse<Product[]>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const body = rawBody as { id: string; name?: string; quantity?: number }[];

  try {
    const productIds = body.map((p) => p.id);

    // Get current products to verify ownership
    const existingProducts = await db
      .select()
      .from(product)
      .where(and(eq(product.userId, user.id), inArray(product.id, productIds)));

    if (existingProducts.length === 0) {
      status(404);
      return { error: "Products not found" };
    }
    if (existingProducts.length !== productIds.length) {
      status(403);
      return { error: "Some products do not belong to the user" };
    }

    const quantityMap = new Map(body.filter((p) => p.quantity !== undefined).map((p) => [p.id, p.quantity!]));
    const nameMap = new Map(body.filter((p) => p.name !== undefined).map((p) => [p.id, p.name!]));

    const productsToUpdateQuantity = body.filter((p) => p.quantity !== undefined).map((p) => p.id);
    const productsToUpdateName = body.filter((p) => p.name !== undefined).map((p) => p.id);

    const setData: { name?: any; quantity?: any; updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (productsToUpdateQuantity.length > 0) {
      setData.quantity = sql`
          CASE 
            ${sql.join(
              productsToUpdateQuantity.map((id) => {
                const newQty = quantityMap.get(id)!;
                return sql`WHEN ${product.id} = ${id} THEN ${newQty}`;
              }),
              sql` `,
            )}
            ELSE ${product.quantity}
          END
        `;
    }

    if (productsToUpdateName.length > 0) {
      setData.name = sql`
          CASE
            ${sql.join(
              productsToUpdateName.map((id) => {
                const newName = nameMap.get(id)!;
                return sql`WHEN ${product.id} = ${id} THEN ${newName}`;
              }),
              sql` `,
            )}
            ELSE ${product.name}
          END
        `;
    }

    if (Object.keys(setData).length === 1) {
      // only updatedAt
      return {
        success: true,
        data: existingProducts,
      };
    }

    const updatedProducts = await db
      .update(product)
      .set(setData)
      .where(and(eq(product.userId, user.id), inArray(product.id, productIds)))
      .returning();

    return {
      success: true,
      data: updatedProducts,
    };
  } catch (error) {
    console.error("Error updating products:", error);
    status(500);
    return {
      error: "Failed to update products",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
