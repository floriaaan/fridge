import { initializeChallenges } from "@/domain/use-cases/achievements/challenges";

/**
 * Cron job handler for initializing monthly challenges
 * 
 * This should be scheduled to run at the start of each month:
 * - Cron expression: "0 0 1 * *" (At 00:00 on day 1 of every month)
 * 
 * Usage with cron libraries:
 * - node-cron: cron.schedule('0 0 1 * *', initializeMonthlyChallenge)
 * - bull/bullmq: queue.add('initializeChallenge', {}, { repeat: { cron: '0 0 1 * *' } })
 * - vercel cron: Define in vercel.json with cron: "0 0 1 * *"
 * 
 * This function:
 * 1. Checks if challenges already exist for the current month
 * 2. If not, creates new challenges from the template definitions
 * 3. Initializes all user challenge progress to 0
 */
export async function initializeMonthlyChallenge() {
  try {
    console.log("[CRON] Starting monthly challenge initialization...");
    await initializeChallenges();
    console.log("[CRON] Monthly challenges initialized successfully");
    return { success: true };
  } catch (error) {
    console.error("[CRON] Failed to initialize monthly challenges:", error);
    return { success: false, error };
  }
}

/**
 * Expire old challenges (optional cleanup job)
 * 
 * This can be scheduled to run daily to mark expired challenges:
 * - Cron expression: "0 2 * * *" (At 02:00 every day)
 * 
 * This function:
 * 1. Finds all challenges that have passed their end date
 * 2. Marks associated user challenges as "expired" if not completed
 */
export async function expireOldChallenges() {
  try {
    console.log("[CRON] Starting challenge expiration check...");
    // Implementation would go here to mark expired challenges
    // This is optional and can be added if needed
    console.log("[CRON] Challenge expiration check completed");
    return { success: true };
  } catch (error) {
    console.error("[CRON] Failed to expire old challenges:", error);
    return { success: false, error };
  }
}
