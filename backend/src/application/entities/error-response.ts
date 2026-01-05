import { t } from "elysia";

export type ErrorResponse = {
  error: string;
  message?: string;
};

export const errorResponse = t.Object({
  error: t.String(),
  message: t.Optional(t.String()),
});
