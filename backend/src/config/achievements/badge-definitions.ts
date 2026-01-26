import type { BadgeType } from "@/infrastructure/database/schema";

export interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  criteria: Record<string, any>;
}

/**
 * Default badge definitions for the achievements system
 */
export const DEFAULT_BADGES: BadgeDefinition[] = [
  {
    type: "first_product",
    name: "First Steps",
    description: "Add your first product",
    icon: "🎯",
    criteria: { minProducts: 1 },
  },
  {
    type: "first_week",
    name: "Week Warrior",
    description: "Use the app for 7 consecutive days",
    icon: "🔥",
    criteria: { minStreak: 7 },
  },
  {
    type: "zero_waste_week",
    name: "Zero Waste Hero",
    description: "Zero waste for a whole week",
    icon: "♻️",
    criteria: { zeroWasteDays: 7 },
  },
  {
    type: "eco_warrior",
    name: "Eco Warrior",
    description: "Achieve an eco score of 80 or higher",
    icon: "🌿",
    criteria: { minEcoScore: 80 },
  },
  {
    type: "recipe_master",
    name: "Recipe Master",
    description: "Generate 10 recipes",
    icon: "👨‍🍳",
    criteria: { minRecipes: 10 },
  },
  {
    type: "scanner_pro",
    name: "Scanner Pro",
    description: "Scan 20 receipts or products",
    icon: "📸",
    criteria: { minScans: 20 },
  },
  {
    type: "money_saver",
    name: "Money Saver",
    description: "Save €50 by not wasting food",
    icon: "💰",
    criteria: { minMoneySaved: 50 },
  },
  {
    type: "consistent_user",
    name: "Consistency King",
    description: "Use the app for 30 days straight",
    icon: "👑",
    criteria: { minStreak: 30 },
  },
];
