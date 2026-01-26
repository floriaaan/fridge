import React, { useState } from "react";
import { Text, View, ScrollView, RefreshControl, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import Header from "@/components/ui/header";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useOverallStats, useStatsByPeriod, useWasteEvolution, useTopCategories } from "@/hooks/use-statistics";
import { useTranslation } from "@/hooks/use-translation";

type Period = "weekly" | "monthly" | "yearly" | "all";

const PERIOD_LABELS: Record<Period, Record<string, string>> = {
  weekly: { en: "This week", fr: "Cette semaine" },
  monthly: { en: "This month", fr: "Ce mois" },
  yearly: { en: "This year", fr: "Cette année" },
  all: { en: "All time", fr: "Tout temps" },
};

interface StatCardProps {
  icon: string;
  iconColor: string;
  bgClass: string;
  darkBgClass: string;
  textClass: string;
  darkTextClass: string;
  value: string;
  label: string;
  index: number;
}

function StatCard({ icon, iconColor, bgClass, darkBgClass, textClass, darkTextClass, value, label, index }: StatCardProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(200 + index * 100).springify().damping(100).stiffness(600)}
      className={`flex-1 rounded-2xl p-4 items-center justify-center min-h-[120px] ${bgClass} ${darkBgClass}`}
    >
      <View className="mb-2">
        <Ionicons name={icon as any} size={28} color={iconColor} />
      </View>
      <Text className={`text-2xl font-bold ${textClass} ${darkTextClass}`}>{value}</Text>
      <Text className={`text-xs text-center mt-2 font-medium ${textClass} ${darkTextClass} opacity-70`}>
        {label}
      </Text>
    </Animated.View>
  );
}

interface CategoryBarProps {
  category: string;
  percentage: number;
  count: number;
  index: number;
  maxPercentage: number;
}

function CategoryBar({ category, percentage, count, index, maxPercentage }: CategoryBarProps) {
  const barWidth = maxPercentage > 0 ? (percentage / maxPercentage) * 100 : 0;
  
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(400 + index * 80)}
      className="mb-3"
    >
      <View className="flex-row justify-between mb-1">
        <Text className="text-neutral-700 dark:text-neutral-300 font-medium capitalize">{category}</Text>
        <Text className="text-neutral-500 dark:text-neutral-400">{count} ({percentage}%)</Text>
      </View>
      <View className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <View 
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${barWidth}%` }}
        />
      </View>
    </Animated.View>
  );
}

function PeriodTabs({ selected, onSelect, locale }: { selected: Period; onSelect: (p: Period) => void; locale: string }) {
  const periods: Period[] = ["weekly", "monthly", "yearly", "all"];
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(100)}
      className="flex-row bg-neutral-200 dark:bg-neutral-800 rounded-xl p-1 mx-4 mb-4"
    >
      {periods.map((period) => (
        <AnimatedPressable
          key={period}
          onPress={() => onSelect(period)}
          className={`flex-1 py-2 px-3 rounded-lg ${
            selected === period ? (isDark ? "bg-neutral-700" : "bg-white") + " shadow-sm" : ""
          }`}
        >
          <Text
            className={`text-center text-xs font-medium ${
              selected === period ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            {PERIOD_LABELS[period][locale.startsWith("fr") ? "fr" : "en"]}
          </Text>
        </AnimatedPressable>
      ))}
    </Animated.View>
  );
}

export default function StatisticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("all");
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  // Use overall stats for "all" period, period-specific stats otherwise
  const { data: overallStats, isLoading: overallLoading, isError: overallError, error: overallErrorData, refetch: refetchOverall, isRefetching: isRefetchingOverall } = useOverallStats();
  const { data: periodStats, isLoading: periodLoading, isError: periodError, error: periodErrorData, refetch: refetchPeriod, isRefetching: isRefetchingPeriod } = useStatsByPeriod(
    selectedPeriod === "all" ? "yearly" : selectedPeriod
  );
  
  // Use the appropriate stats based on selected period
  const stats = selectedPeriod === "all" ? overallStats : periodStats;
  const isLoading = selectedPeriod === "all" ? overallLoading : periodLoading;
  const isError = selectedPeriod === "all" ? overallError : periodError;
  const error = selectedPeriod === "all" ? overallErrorData : periodErrorData;
  const refetch = selectedPeriod === "all" ? refetchOverall : refetchPeriod;
  const isRefetching = selectedPeriod === "all" ? isRefetchingOverall : isRefetchingPeriod;
  
  const { data: evolution } = useWasteEvolution(6);
  const { data: categories } = useTopCategories(5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatCO2 = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}t`;
    }
    return `${value.toFixed(1)}kg`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isError) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-neutral-100 dark:bg-black">
        <Header title={t("tabs.statistics")} />
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text className="text-neutral-700 dark:text-neutral-300 text-center mt-4">{t("common.error")}</Text>
          <Text className="text-neutral-500 dark:text-neutral-400 text-center mt-2">{error?.message}</Text>
          <AnimatedPressable
            onPress={() => refetch()}
            className="mt-4 bg-emerald-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-medium">{t("common.retry")}</Text>
          </AnimatedPressable>
        </View>
      </SafeAreaView>
    );
  }

  const maxCategoryPercentage = categories
    ? Math.max(...categories.map((c) => c.percentage))
    : 0;

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-neutral-100 dark:bg-black">
      <Header title={t("tabs.statistics")} />
      
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={isDark ? "white" : "black"} />
        }
      >
        {/* Period Selector */}
        <PeriodTabs selected={selectedPeriod} onSelect={setSelectedPeriod} locale={i18n.locale} />

        {/* Overview Cards */}
        <View className="px-4 mb-6">
          <Animated.Text
            entering={FadeInUp.duration(400)}
            className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4"
          >
            {t("statistics.overview")}
          </Animated.Text>
          
          <View className="flex-row gap-3 mb-3">
            <StatCard
              icon="analytics-outline"
              iconColor="#DC2626"
              bgClass="bg-red-50"
              darkBgClass="dark:bg-red-900/30"
              textClass="text-red-700"
              darkTextClass="dark:text-red-300"
              value={isLoading ? "..." : formatPercentage(stats?.wasteRate ?? 0)}
              label={t("statistics.wasteRate")}
              index={0}
            />
            <StatCard
              icon="wallet-outline"
              iconColor="#059669"
              bgClass="bg-emerald-50"
              darkBgClass="dark:bg-emerald-900/30"
              textClass="text-emerald-700"
              darkTextClass="dark:text-emerald-300"
              value={isLoading ? "..." : formatCurrency(stats?.moneySaved ?? 0)}
              label={t("statistics.saved")}
              index={1}
            />
          </View>
          
          <View className="flex-row gap-3">
            <StatCard
              icon="leaf-outline"
              iconColor="#0891B2"
              bgClass="bg-cyan-50"
              darkBgClass="dark:bg-cyan-900/30"
              textClass="text-cyan-700"
              darkTextClass="dark:text-cyan-300"
              value={isLoading ? "..." : formatCO2(stats?.co2Avoided ?? 0)}
              label={t("statistics.co2Avoided")}
              index={2}
            />
            <StatCard
              icon="cube-outline"
              iconColor="#7C3AED"
              bgClass="bg-purple-50"
              darkBgClass="dark:bg-purple-900/30"
              textClass="text-purple-700"
              darkTextClass="dark:text-purple-300"
              value={isLoading ? "..." : String(stats?.totalProducts ?? 0)}
              label={t("statistics.productsManaged")}
              index={3}
            />
          </View>
        </View>

        {/* Motivation Message */}
        {stats?.motivationMessage && (
          <Animated.View
            entering={FadeInUp.duration(400).delay(500)}
            className="mx-4 mb-6 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl p-4"
          >
            <Text className="text-emerald-800 dark:text-emerald-200 text-center font-medium">
              {stats.motivationMessage}
            </Text>
          </Animated.View>
        )}

        {/* Product Status */}
        <View className="px-4 mb-6">
          <Animated.Text
            entering={FadeInUp.duration(400).delay(300)}
            className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4"
          >
            {t("statistics.productDistribution")}
          </Animated.Text>
          
          <Animated.View
            entering={FadeInUp.duration(400).delay(400)}
            className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4"
          >
            <View className="flex-row justify-between mb-3">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats?.consumedProducts ?? 0}
                </Text>
                <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t("statistics.consumed")}</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats?.discardedProducts ?? 0}
                </Text>
                <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t("statistics.discarded")}</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.activeProducts ?? 0}
                </Text>
                <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t("statistics.active")}</Text>
              </View>
            </View>
            
            {stats && stats.consumedProducts + stats.discardedProducts > 0 && (
              <View className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden flex-row">
                <View
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${
                      (stats.consumedProducts /
                        (stats.consumedProducts + stats.discardedProducts)) *
                      100
                    }%`,
                  }}
                />
                <View
                  className="h-full bg-red-500"
                  style={{
                    width: `${
                      (stats.discardedProducts /
                        (stats.consumedProducts + stats.discardedProducts)) *
                      100
                    }%`,
                  }}
                />
              </View>
            )}
          </Animated.View>
        </View>

        {/* Evolution Trend */}
        {evolution && (
          <View className="px-4 mb-6">
            <Animated.Text
              entering={FadeInDown.duration(400).delay(350)}
              className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4"
            >
              {t("statistics.evolution")}
            </Animated.Text>
            
            <Animated.View
              entering={FadeInDown.duration(400).delay(450)}
              className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-neutral-500 dark:text-neutral-400 text-sm">{t("statistics.sixMonthAverage")}</Text>
                  <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {formatPercentage(evolution.averageWasteRate)}
                  </Text>
                </View>
                <View
                  className={`flex-row items-center px-3 py-2 rounded-full ${
                    evolution.trend === "down"
                      ? "bg-emerald-100 dark:bg-emerald-900/50"
                      : evolution.trend === "up"
                      ? "bg-red-100 dark:bg-red-900/50"
                      : "bg-neutral-100 dark:bg-neutral-700"
                  }`}
                >
                  <Ionicons
                    name={
                      evolution.trend === "down"
                        ? "trending-down"
                        : evolution.trend === "up"
                        ? "trending-up"
                        : "remove"
                    }
                    size={16}
                    color={
                      evolution.trend === "down"
                        ? "#059669"
                        : evolution.trend === "up"
                        ? "#DC2626"
                        : isDark ? "#a3a3a3" : "#6B7280"
                    }
                  />
                  <Text
                    className={`ml-1 font-medium ${
                      evolution.trend === "down"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : evolution.trend === "up"
                        ? "text-red-600 dark:text-red-400"
                        : "text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {evolution.trend === "down"
                      ? t("statistics.decreasing")
                      : evolution.trend === "up"
                      ? t("statistics.increasing")
                      : t("statistics.stable")}
                  </Text>
                </View>
              </View>
              
              {/* Simple bar chart for evolution */}
              <View className="flex-row items-end justify-between h-20">
                {evolution.points.map((point) => {
                  const maxRate = Math.max(...evolution.points.map((p) => p.wasteRate), 1);
                  const height = (point.wasteRate / maxRate) * 100;
                  return (
                    <View key={point.date} className="items-center flex-1 mx-0.5">
                      <View
                        className="w-full bg-emerald-400 rounded-t"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      />
                      <Text className="text-[9px] text-neutral-400 mt-1">
                        {point.date.slice(5)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          </View>
        )}

        {/* Top Categories */}
        {categories && categories.length > 0 && (
          <View className="px-4 mb-6">
            <Animated.Text
              entering={FadeInDown.duration(400).delay(350)}
              className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4"
            >
              {t("statistics.topCategories")}
            </Animated.Text>
            
            <Animated.View
              entering={FadeInDown.duration(400).delay(400)}
              className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4"
            >
              {categories.map((cat, index) => (
                <CategoryBar
                  key={cat.category}
                  category={cat.category}
                  percentage={cat.percentage}
                  count={cat.count}
                  index={index}
                  maxPercentage={maxCategoryPercentage}
                />
              ))}
            </Animated.View>
          </View>
        )}

        {/* Money Details */}
        {stats && (
          <View className="px-4 mb-6">
            <Animated.Text
              entering={FadeInDown.duration(400).delay(500)}
              className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4"
            >
              {t("statistics.financialImpact")}
            </Animated.Text>
            
            <Animated.View
              entering={FadeInDown.duration(400).delay(550)}
              className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4"
            >
              <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-neutral-100 dark:border-neutral-700">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark-circle" size={18} color="#059669" />
                  </View>
                  <Text className="text-neutral-700 dark:text-neutral-300">{t("statistics.savingsRealized")}</Text>
                </View>
                <Text className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {formatCurrency(stats.moneySaved)}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-full items-center justify-center mr-3">
                    <Ionicons name="close-circle" size={18} color="#DC2626" />
                  </View>
                  <Text className="text-neutral-700 dark:text-neutral-300">{t("statistics.losses")}</Text>
                </View>
                <Text className="text-red-600 dark:text-red-400 font-bold">
                  {formatCurrency(stats.moneyWasted)}
                </Text>
              </View>
            </Animated.View>
          </View>
        )}

        {/* Bottom Padding */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
