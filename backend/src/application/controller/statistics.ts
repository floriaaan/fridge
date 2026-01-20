import Elysia from "elysia";
import { authMiddleware } from "@/application/middleware/auth";
import {
  getOverallStats,
  getStatsByPeriod,
  getWasteEvolution,
  getTopCategories,
} from "@/domain/use-cases/statistics";

export const statisticsController = new Elysia({
  prefix: "/statistics",
})
  .use(authMiddleware)
  .get("/overview", getOverallStats, { auth: true })
  .get("/period/:period", getStatsByPeriod, { auth: true })
  .get("/evolution", getWasteEvolution, { auth: true })
  .get("/categories", getTopCategories, { auth: true });
