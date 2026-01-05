import { ErrorResponse } from "@/application/entities/error-response";
import { t } from "elysia";

export type FridgeResponse<T> =
  | {
      success: true;
      data: T;
    }
  | ErrorResponse;


