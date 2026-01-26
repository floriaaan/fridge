import Elysia from "elysia";
import { authMiddleware } from "@/application/middleware/auth";
import {
  getUserProfile,
  getLeaderboard,
  getUserBadges,
  getAllBadges,
  getActiveChallenges,
  getCompletedChallenges,
} from "@/domain/use-cases/gamification";

export const gamificationController = new Elysia({
  prefix: "/gamification",
})
  .use(authMiddleware)
  .get("/profile", getUserProfile, { auth: true })
  .get("/leaderboard", getLeaderboard)
  .get("/badges", getUserBadges, { auth: true })
  .get("/badges/all", getAllBadges)
  .get("/challenges/active", getActiveChallenges, { auth: true })
  .get("/challenges/completed", getCompletedChallenges, { auth: true });
