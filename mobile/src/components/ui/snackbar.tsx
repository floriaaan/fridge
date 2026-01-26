import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

export interface SnackbarRef {
  show: (message: string, duration?: number) => void;
}

type SnackbarProps = {
  offsetType?: "safe" | "tabbar";
  extraBottom?: number;
};

const TAB_BAR_HEIGHT_IOS = 50;
const TAB_BAR_HEIGHT_ANDROID = 56;

const Snackbar = forwardRef<SnackbarRef, SnackbarProps>(function Snackbar(
  { offsetType = "safe", extraBottom = 8 },
  ref
) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const translateY = useSharedValue(100);
  const insets = useSafeAreaInsets();

  useImperativeHandle(ref, () => ({
    show: (msg: string, duration: number = 3000) => {
      setMessage(msg);
      setVisible(true);
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });

      setTimeout(() => {
        translateY.value = withTiming(100, {
          duration: 300,
          easing: Easing.in(Easing.ease),
        });
        setTimeout(() => setVisible(false), 300);
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

  return (
    <Animated.View
      className="absolute left-5 right-5 bg-neutral-800 dark:bg-neutral-200 p-4 rounded-3xl z-50"
      style={[
        animatedStyle,
        {
          bottom:
            (insets.bottom || 0) +
            (offsetType === "tabbar"
              ? (Platform.OS === "ios" ? TAB_BAR_HEIGHT_IOS : TAB_BAR_HEIGHT_ANDROID)
              : 0) +
            extraBottom,
        },
      ]}
      pointerEvents="none"
    >
      <Text className="text-white dark:text-neutral-900">{message}</Text>
    </Animated.View>
  );
});

Snackbar.displayName = "Snackbar";

export default Snackbar;
