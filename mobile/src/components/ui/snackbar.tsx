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

const Snackbar = forwardRef<SnackbarRef>((props, ref) => {
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
      style={[
        {
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: "#323232",
          padding: 16,
          borderRadius: 8,
          zIndex: 1000,
        },
        animatedStyle,
      ]}
    >
      <Text style={{ color: "white" }}>{message}</Text>
    </Animated.View>
  );
});

Snackbar.displayName = "Snackbar";

export default Snackbar;
