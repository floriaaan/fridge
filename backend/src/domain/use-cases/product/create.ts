import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import { CreateProductInput, type Product } from "@/domain/entity/product";
import { Context, t } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import fetch from "node-fetch";

interface OpenFoodFactsProduct {
  _id: string;
  url: string;
}

interface OpenFoodFactsSearchResponse {
  products: OpenFoodFactsProduct[];
}

interface OpenFoodFactsProductResponse {
  product: OpenFoodFactsProduct;
  status: number;
}

const getOpenFoodFactsData = async (
  productName: string,
  openfoodfactId?: string,
): Promise<{ openfoodfactId: string; slug: string } | null> => {
  try {
    let finalOpenFoodFactId = openfoodfactId;

    if (!finalOpenFoodFactId) {
      const searchResponse = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          productName,
        )}&search_simple=1&action=process&json=1`,
      );
      const searchData = (await searchResponse.json()) as OpenFoodFactsSearchResponse;

      if (searchData.products && searchData.products.length > 0) {
        finalOpenFoodFactId = searchData.products[0]._id;
      }
    }

    if (finalOpenFoodFactId) {
      const productResponse = await fetch(
        `https://world.openfoodfacts.net/api/v2/product/${finalOpenFoodFactId}.json`,
      );
      const productData = (await productResponse.json()) as OpenFoodFactsProductResponse;

      if (productData.status === 1 && productData.product && productData.product.url) {
        const urlParts = productData.product.url.split("/");
        const slug = urlParts[urlParts.length - 1];
        return {
          openfoodfactId: finalOpenFoodFactId,
          slug,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching from Open Food Facts API:", error);
  }

  return null;
};


export const createProducts = async ({
  user,
  body,
  status,
}: Context & { user: User}
): Promise<FridgeResponse<Product[]>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const products = body as CreateProductInput[];

  try {
    const productsToInsert = await Promise.all(
      products.map(async (p) => {
        const offData = await getOpenFoodFactsData(p.name, p.openfoodfactId);
        return {
          userId: user.id,
          name: p.name,
          quantity: p.quantity,
          unit: p.unit,
          location: p.location,
          expiresAt: p.expiresAt ? new Date(p.expiresAt) : null,
          openedAt: p.openedAt ? new Date(p.openedAt) : null,
          category: p.category,
          openfoodfactId: offData?.openfoodfactId ?? null,
          slug: offData?.slug ?? null,
        };
      })
    );

    const createdProducts = await db
      .insert(product)
      .values(productsToInsert)
      .returning();

    status(201);
    return {
      success: true,
      data: createdProducts,
    };
  } catch (error) {
    console.error("Error creating products:", error);
    status(500);
    return {
      error: "Failed to create products",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const createProductSchema = t.Array(
  t.Object({
    name: t.String(),
    quantity: t.Integer(),
    unit: t.String(),
    location: t.String(),
    expiresAt: t.Optional(t.String()),
    openedAt: t.Optional(t.String()),
    category: t.String(),
    openfoodfactId: t.Optional(t.String()),
  }),
);
