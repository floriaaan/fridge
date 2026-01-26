import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

export interface ChallengeSnackbarRef {
  show: (title: string, progress: number, target: number, duration?: number) => void;
}

type ChallengeSnackbarProps = {
  // No props needed for now
};

const ChallengeSnackbar = forwardRef<ChallengeSnackbarRef, ChallengeSnackbarProps>(
  function ChallengeSnackbar(props, ref) {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [progress, setProgress] = useState(0);
    const [target, setTarget] = useState(0);
    const translateY = useSharedValue(-100);
    const insets = useSafeAreaInsets();

    useImperativeHandle(ref, () => ({
      show: (
        challengeTitle: string,
        currentProgress: number,
        challengeTarget: number,
        duration: number = 3000
      ) => {
        setTitle(challengeTitle);
        setProgress(currentProgress);
        setTarget(challengeTarget);
        setVisible(true);

        // Animate in
        translateY.value = withTiming(0, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        });

        // Auto hide after duration
        setTimeout(() => {
          translateY.value = withTiming(-100, {
            duration: 400,
            easing: Easing.in(Easing.cubic),
          });
          setTimeout(() => setVisible(false), 400);
        }, duration);
      },
    }));

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
      };
    });

    if (!visible) {
      return null;
    }

    const percentage = Math.round((progress / target) * 100);
    const isCompleted = progress >= target;

    return (
      <Animated.View
        className="absolute left-4 right-4 z-50"
        style={[
          animatedStyle,
          {
            top: insets.top + 8,
          },
        ]}
        pointerEvents="none"
      >
        <View
          className={`rounded-2xl p-4 shadow-lg ${
            isCompleted
              ? "bg-emerald-500"
              : "bg-gradient-to-r from-amber-500 to-orange-500"
          }`}
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
              <Ionicons
                name={isCompleted ? "trophy" : "trending-up"}
                size={20}
                color="white"
              />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm">
                {isCompleted ? "🎉 Challenge Completed!" : "💪 Challenge Progress"}
              </Text>
              <Text className="text-white/90 text-xs mt-0.5">{title}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-white/80 text-xs font-medium">
                {progress}/{target}
              </Text>
              <Text className="text-white font-bold text-xs">{percentage}%</Text>
            </View>
            <View className="h-2 bg-white/20 rounded-full overflow-hidden">
              <View
                className="h-full bg-white rounded-full"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }
);

ChallengeSnackbar.displayName = "ChallengeSnackbar";

export default ChallengeSnackbar;
