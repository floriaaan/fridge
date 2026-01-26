export interface ChallengeDefinition {
  type: "monthly" | "weekly";
  title: string;
  description: string;
  goal: {
    type: string;
    target: number;
  };
  reward: {
    points: number;
    badge: string | null;
  };
}

/**
 * Monthly challenge templates
 * These are initialized at the start of each month via cron job
 */
export const MONTHLY_CHALLENGES: ChallengeDefinition[] = [
  {
    type: "monthly",
    title: "Zero Waste Champion",
    description: "Achieve zero waste for 15 days this month",
    goal: { type: "zero_waste_days", target: 15 },
    reward: { points: 200, badge: null },
  },
  {
    type: "monthly",
    title: "Recipe Explorer",
    description: "Generate and try 5 recipes this month",
    goal: { type: "recipes_generated", target: 5 },
    reward: { points: 150, badge: null },
  },
  {
    type: "monthly",
    title: "Savings Master",
    description: "Save €30 by not wasting food this month",
    goal: { type: "money_saved", target: 30 },
    reward: { points: 250, badge: null },
  },
];

/**
 * Weekly challenge templates (optional)
 * Can be enabled if weekly challenges are needed
 */
export const WEEKLY_CHALLENGES: ChallengeDefinition[] = [
  // Add weekly challenges here if needed
];
