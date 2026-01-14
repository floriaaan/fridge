import { Context, t } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { ai } from "@/infrastructure/ai";
import { env } from "@/lib/env";

export interface ParsedReceiptProduct {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

export const parseReceipt = async ({
  user,
  body,
  status,
}: Context & { user: User }): Promise<FridgeResponse<ParsedReceiptProduct[]>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const { imageBase64 } = body as { imageBase64: string };

  if (!imageBase64) {
    status(400);
    return { error: "Missing image data" };
  }

  try {
    const products = await ai.parseReceiptImage(
      imageBase64,
      env.USER_LANGUAGE || "en"
    );

    status(200);
    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error("Error parsing receipt:", error);
    status(500);
    return {
      error: "Failed to parse receipt",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const parseReceiptSchema = t.Object({
  imageBase64: t.String(),
});
