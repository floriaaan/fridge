import React, { useState } from "react";
import { Text, View, ScrollView, RefreshControl, useColorScheme, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import Header from "@/components/ui/header";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  useGamificationProfile,
  useUserBadges,
  useAllBadges,
  useActiveChallenges,
} from "@/hooks/use-achievements";
import { useTranslation } from "@/hooks/use-translation";

interface BadgeCardProps {
  icon: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
  index: number;
}

function BadgeCard({ icon, name, description, earned, earnedAt, index }: BadgeCardProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(100 + index * 50)}
      className={`rounded-2xl p-4 mb-3 ${
        earned
          ? "bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700"
          : "bg-neutral-100 dark:bg-neutral-800 opacity-60"
      }`}
    >
      <View className="flex-row items-center">
        <Text className="text-4xl mr-3">{icon}</Text>
        <View className="flex-1">
          <Text
            className={`text-base font-bold ${
              earned ? "text-amber-900 dark:text-amber-100" : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            {name}
          </Text>
          <Text
            className={`text-sm mt-1 ${
              earned ? "text-amber-700 dark:text-amber-300" : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            {description}
          </Text>
          {earned && earnedAt && (
            <Text className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {new Date(earnedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
        {earned && (
          <Ionicons name="checkmark-circle" size={24} color="#f59e0b" />
        )}
      </View>
    </Animated.View>
  );
}

interface ChallengeCardProps {
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  index: number;
}

function ChallengeCard({ title, description, progress, target, reward, index }: ChallengeCardProps) {
  const percentage = Math.min((progress / target) * 100, 100);
  
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(100 + index * 50)}
      className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4 mb-3"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {title}
          </Text>
          <Text className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {description}
          </Text>
        </View>
        <View className="bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 rounded-full">
          <Text className="text-emerald-700 dark:text-emerald-300 font-bold">
            +{reward} pts
          </Text>
        </View>
      </View>
      
      <View className="mt-3">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-neutral-600 dark:text-neutral-400">
            Progress: {progress}/{target}
          </Text>
          <Text className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {percentage.toFixed(0)}%
          </Text>
        </View>
        <View className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <View
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </View>
      </View>
    </Animated.View>
  );
}

type Tab = "profile" | "badges" | "challenges";

export default function GamificationScreen() {
  const [selectedTab, setSelectedTab] = useState<Tab>("profile");
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile, isRefetching: isRefetchingProfile } = useGamificationProfile();
  const { data: userBadges, isLoading: badgesLoading, refetch: refetchBadges, isRefetching: isRefetchingBadges } = useUserBadges();
  const { data: allBadges, isLoading: allBadgesLoading } = useAllBadges();
  const { data: challenges, isLoading: challengesLoading, refetch: refetchChallenges, isRefetching: isRefetchingChallenges } = useActiveChallenges();

  const isRefreshing = isRefetchingProfile || isRefetchingBadges || isRefetchingChallenges;

  const handleRefresh = () => {
    refetchProfile();
    refetchBadges();
    refetchChallenges();
  };

  // Calculate level progress
  const currentLevelPoints = profile ? (profile.level - 1) * 100 : 0;
  const nextLevelPoints = profile ? profile.level * 100 : 100;
  const levelProgress = profile
    ? ((profile.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100
    : 0;

  // Merge badges with earned status
  const badgesWithStatus = allBadges?.map((badge) => {
    const earned = userBadges?.find((ub) => ub.badge.id === badge.id);
    return {
      ...badge,
      earned: !!earned,
      earnedAt: earned?.earnedAt,
    };
  }) || [];

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-neutral-100 dark:bg-black">
      <Header title={t("tabs.gamification") || "Gamification"} showBackButton />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={isDark ? "white" : "black"} />
        }
      >
        {/* Tab Selector */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          className="flex-row bg-neutral-200 dark:bg-neutral-800 rounded-xl p-1 mx-4 my-4"
        >
          <AnimatedPressable
            onPress={() => setSelectedTab("profile")}
            className={`flex-1 py-2 px-3 rounded-lg ${
              selectedTab === "profile" ? (isDark ? "bg-neutral-700" : "bg-white") + " shadow-sm" : ""
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                selectedTab === "profile" ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              Profile
            </Text>
          </AnimatedPressable>
          
          <AnimatedPressable
            onPress={() => setSelectedTab("badges")}
            className={`flex-1 py-2 px-3 rounded-lg ${
              selectedTab === "badges" ? (isDark ? "bg-neutral-700" : "bg-white") + " shadow-sm" : ""
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                selectedTab === "badges" ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              Badges
            </Text>
          </AnimatedPressable>
          
          <AnimatedPressable
            onPress={() => setSelectedTab("challenges")}
            className={`flex-1 py-2 px-3 rounded-lg ${
              selectedTab === "challenges" ? (isDark ? "bg-neutral-700" : "bg-white") + " shadow-sm" : ""
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                selectedTab === "challenges" ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              Challenges
            </Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Profile Tab */}
        {selectedTab === "profile" && profile && (
          <View className="px-4">
            {/* Level & Points Card */}
            <Animated.View
              entering={FadeInUp.duration(400).delay(200)}
              className="bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl p-6 mb-4"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-white/80 text-sm">Current Level</Text>
                  <Text className="text-white text-4xl font-bold">Level {profile.level}</Text>
                </View>
                <View className="bg-white/20 w-16 h-16 rounded-full items-center justify-center">
                  <Ionicons name="trophy" size={32} color="white" />
                </View>
              </View>
              
              <View className="mb-2">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-white/80 text-sm">{profile.points} / {nextLevelPoints} points</Text>
                  <Text className="text-white font-medium">{levelProgress.toFixed(0)}%</Text>
                </View>
                <View className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-white rounded-full"
                    style={{ width: `${levelProgress}%` }}
                  />
                </View>
              </View>
            </Animated.View>

            {/* Stats Grid */}
            <View className="flex-row gap-3 mb-4">
              <Animated.View
                entering={FadeInUp.duration(400).delay(300)}
                className="flex-1 bg-amber-50 dark:bg-amber-900/30 rounded-2xl p-4 items-center"
              >
                <Ionicons name="flame" size={28} color="#f59e0b" />
                <Text className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-2">
                  {profile.streak}
                </Text>
                <Text className="text-xs text-amber-600 dark:text-amber-400 mt-1">Day Streak</Text>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.duration(400).delay(350)}
                className="flex-1 bg-purple-50 dark:bg-purple-900/30 rounded-2xl p-4 items-center"
              >
                <Ionicons name="ribbon" size={28} color="#9333ea" />
                <Text className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                  {profile.totalBadges}
                </Text>
                <Text className="text-xs text-purple-600 dark:text-purple-400 mt-1">Badges</Text>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.duration(400).delay(400)}
                className="flex-1 bg-cyan-50 dark:bg-cyan-900/30 rounded-2xl p-4 items-center"
              >
                <Ionicons name="leaf" size={28} color="#06b6d4" />
                <Text className="text-2xl font-bold text-cyan-700 dark:text-cyan-300 mt-2">
                  {parseFloat(profile.ecoScore).toFixed(0)}
                </Text>
                <Text className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">Eco Score</Text>
              </Animated.View>
            </View>

            {/* Completed Challenges */}
            <Animated.View
              entering={FadeInUp.duration(400).delay(450)}
              className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4 mb-4"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-neutral-900 dark:text-neutral-100 font-bold text-lg">
                    Challenges Completed
                  </Text>
                  <Text className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                    Keep completing challenges to earn more points!
                  </Text>
                </View>
                <Text className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {profile.totalChallengesCompleted}
                </Text>
              </View>
            </Animated.View>
          </View>
        )}

        {/* Badges Tab */}
        {selectedTab === "badges" && (
          <View className="px-4">
            <Animated.Text
              entering={FadeInUp.duration(400)}
              className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4"
            >
              Your Badge Collection
            </Animated.Text>
            
            {badgesWithStatus.map((badge, index) => (
              <BadgeCard
                key={badge.id}
                icon={badge.icon}
                name={badge.name}
                description={badge.description}
                earned={badge.earned}
                earnedAt={badge.earnedAt}
                index={index}
              />
            ))}
          </View>
        )}

        {/* Challenges Tab */}
        {selectedTab === "challenges" && (
          <View className="px-4">
            <Animated.Text
              entering={FadeInUp.duration(400)}
              className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4"
            >
              Active Challenges
            </Animated.Text>
            
            {challenges && challenges.length > 0 ? (
              challenges.map((challenge, index) => (
                <ChallengeCard
                  key={challenge.id}
                  title={challenge.title}
                  description={challenge.description}
                  progress={challenge.userProgress?.progress?.current || 0}
                  target={challenge.goal?.target || 0}
                  reward={challenge.reward?.points || 0}
                  index={index}
                />
              ))
            ) : (
              <Animated.View
                entering={FadeInUp.duration(400).delay(200)}
                className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-6 items-center"
              >
                <Ionicons name="trophy-outline" size={48} color={isDark ? "#737373" : "#a3a3a3"} />
                <Text className="text-neutral-600 dark:text-neutral-400 text-center mt-4">
                  No active challenges at the moment. Check back soon!
                </Text>
              </Animated.View>
            )}
          </View>
        )}

        {/* Bottom Padding */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
