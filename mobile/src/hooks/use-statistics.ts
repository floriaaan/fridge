import { useQuery } from '@tanstack/react-query';
import {
  fetchOverallStats,
  fetchStatsByPeriod,
  fetchWasteEvolution,
  fetchTopCategories,
} from '@/lib/api/fetch-statistics';

export function useOverallStats() {
  return useQuery({
    queryKey: ['statistics', 'overview'],
    queryFn: fetchOverallStats,
  });
}

export function useStatsByPeriod(
  period: "daily" | "weekly" | "monthly" | "yearly",
  date?: string
) {
  return useQuery({
    queryKey: ['statistics', 'period', period, date],
    queryFn: () => fetchStatsByPeriod(period, date),
  });
}

export function useWasteEvolution(months: number = 6) {
  return useQuery({
    queryKey: ['statistics', 'evolution', months],
    queryFn: () => fetchWasteEvolution(months),
  });
}

export function useTopCategories(limit: number = 10) {
  return useQuery({
    queryKey: ['statistics', 'categories', limit],
    queryFn: () => fetchTopCategories(limit),
  });
}
