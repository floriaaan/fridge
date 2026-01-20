import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

export interface SnackbarRef {
  show: (message: string, duration?: number) => void;
}

const Snackbar = forwardRef<SnackbarRef>(function Snackbar(props, ref) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const translateY = useSharedValue(100);

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
      className="absolute bottom-5 left-5 right-5 bg-neutral-800 dark:bg-neutral-200 p-4 rounded-lg z-50"
      style={animatedStyle}
      pointerEvents="none"
    >
      <Text className="text-white dark:text-neutral-900">{message}</Text>
    </Animated.View>
  );
});

Snackbar.displayName = "Snackbar";

export default Snackbar;
