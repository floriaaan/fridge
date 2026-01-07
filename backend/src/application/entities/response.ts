import { ErrorResponse } from "@/application/entities/error-response";

export type FridgeResponse<T> =
  | {
      success: true;
      data: T;
      meta?: Record<string, unknown>;
    }
  | ErrorResponse;
