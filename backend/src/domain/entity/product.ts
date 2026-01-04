import { t } from "elysia";

export interface Product {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string; // g, ml, piece, etc.
  location: string; // fridge, freezer, pantry, etc.
  expiresAt: Date | null;
  openedAt: Date | null;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  quantity: number;
  unit: string;
  location: string;
  expiresAt?: string; // ISO date string
  openedAt?: string; // ISO date string
  category: string;
}

export const productSchema = t.Object({
  id: t.Optional(t.String()),
  userId: t.Optional(t.String()),
  name: t.String(),
  quantity: t.Integer(),
  unit: t.String(),
  location: t.String(),
  expiresAt: t.Union([t.Date(), t.Null()]),
  openedAt: t.Union([t.Date(), t.Null()]),
  category: t.String(),
  createdAt: t.Optional(t.Date()),
  updatedAt: t.Optional(t.Date()),
});
