import { Context, t } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { db } from "@/infrastructure/database";
import { receipt, product } from "@/infrastructure/database/schema";
import { Product } from "@/domain/entity/product";
import { Receipt } from "@/domain/entity/receipt";

interface ImportReceiptItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  location: string;
  openfoodfactId?: string;
  estimatedExpiryDays?: number;
}

interface ImportReceiptInput {
  storeName: string;
  totalAmount: number;
  date: string;
  items: ImportReceiptItem[];
  imageUrl?: string;
  ocrRawData?: any;
}

export const importReceipt = async ({
  user,
  body,
  status,
}: Context & { user: User }): Promise<FridgeResponse<{ receipt: Receipt; products: Product[] }>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const input = body as ImportReceiptInput;

  if (!input.items || input.items.length === 0) {
    status(400);
    return { error: "No items to import" };
  }

  try {
    // Create receipt record
    const [createdReceipt] = await db
      .insert(receipt)
      .values({
        userId: user.id,
        storeName: input.storeName,
        totalAmount: input.totalAmount.toString(),
        imageUrl: input.imageUrl || null,
        ocrRawData: input.ocrRawData || null,
        itemsCount: input.items.length,
        scannedAt: new Date(input.date),
      })
      .returning();

    if (!createdReceipt) {
      throw new Error("Failed to create receipt");
    }

    // Create product records
    const productsToInsert = input.items.map((item) => {
      let expiresAt: Date | null = null;
      if (item.estimatedExpiryDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + item.estimatedExpiryDays);
      }

      return {
        userId: user.id,
        receiptId: createdReceipt.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        location: item.location || "frigo",
        expiresAt,
        openedAt: null,
        category: item.category,
        openfoodfactId: item.openfoodfactId || null,
        categories: null,
        price: item.price.toString(),
      };
    });

    const createdProducts = await db
      .insert(product)
      .values(productsToInsert)
      .returning();

    status(201);
    return {
      success: true,
      data: {
        receipt: createdReceipt,
        products: createdProducts,
      },
    };
  } catch (error) {
    console.error("Error importing receipt:", error);
    status(500);
    return {
      error: "Failed to import receipt",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const importReceiptSchema = t.Object({
  storeName: t.String(),
  totalAmount: t.Number(),
  date: t.String(),
  items: t.Array(
    t.Object({
      name: t.String(),
      quantity: t.Number(),
      unit: t.String(),
      price: t.Number(),
      category: t.String(),
      location: t.String(),
      openfoodfactId: t.Optional(t.String()),
      estimatedExpiryDays: t.Optional(t.Number()),
    })
  ),
  imageUrl: t.Optional(t.String()),
  ocrRawData: t.Optional(t.Any()),
});
