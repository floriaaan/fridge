import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { db } from "@/infrastructure/database";
import { receipt } from "@/infrastructure/database/schema";
import { Receipt } from "@/domain/entity/receipt";
import { desc, eq } from "drizzle-orm";

export const getReceiptHistory = async ({
  user,
  status,
}: Context & { user: User }): Promise<FridgeResponse<Receipt[]>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  try {
    const receipts = await db
      .select()
      .from(receipt)
      .where(eq(receipt.userId, user.id))
      .orderBy(desc(receipt.scannedAt));

    status(200);
    return {
      success: true,
      data: receipts as Receipt[],
    };
  } catch (error) {
    console.error("Error fetching receipt history:", error);
    status(500);
    return {
      error: "Failed to fetch receipt history",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
