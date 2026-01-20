import { t } from "elysia";

export interface OverallStats {
  totalProducts: number;
  consumedProducts: number;
  discardedProducts: number;
  activeProducts: number;
  wasteRate: number; // percentage
  moneySaved: number;
  moneyWasted: number;
  co2Avoided: number;
  topCategories: CategoryStat[];
  motivationMessage: string;
}

export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

export interface PeriodStats extends OverallStats {
  period: "daily" | "weekly" | "monthly" | "yearly";
  periodStart: Date;
  periodEnd: Date;
}

export interface WasteEvolutionPoint {
  date: string;
  wasteRate: number;
  consumedProducts: number;
  discardedProducts: number;
  totalProducts: number;
}

export interface WasteEvolution {
  points: WasteEvolutionPoint[];
  trend: "up" | "down" | "stable";
  averageWasteRate: number;
}

export interface StatisticsComparison {
  currentPeriod: number;
  previousPeriod: number;
  change: number; // percentage change
  trend: "up" | "down" | "stable";
  message: string;
}

export const overallStatsSchema = t.Object({
  totalProducts: t.Integer(),
  consumedProducts: t.Integer(),
  discardedProducts: t.Integer(),
  activeProducts: t.Integer(),
  wasteRate: t.Number(),
  moneySaved: t.Number(),
  moneyWasted: t.Number(),
  co2Avoided: t.Number(),
  topCategories: t.Array(
    t.Object({
      category: t.String(),
      count: t.Integer(),
      percentage: t.Number(),
    })
  ),
  motivationMessage: t.String(),
});

export const periodStatsSchema = t.Intersect([
  overallStatsSchema,
  t.Object({
    period: t.Union([
      t.Literal("daily"),
      t.Literal("weekly"),
      t.Literal("monthly"),
      t.Literal("yearly"),
    ]),
    periodStart: t.Date(),
    periodEnd: t.Date(),
  }),
]);

export const wasteEvolutionSchema = t.Object({
  points: t.Array(
    t.Object({
      date: t.String(),
      wasteRate: t.Number(),
      consumedProducts: t.Integer(),
      discardedProducts: t.Integer(),
      totalProducts: t.Integer(),
    })
  ),
  trend: t.Union([t.Literal("up"), t.Literal("down"), t.Literal("stable")]),
  averageWasteRate: t.Number(),
});
