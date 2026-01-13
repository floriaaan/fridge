import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface SnackbarProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  onDismiss,
}) => {
  const translateY = useSharedValue(100);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(100, {
        duration: 300,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [visible, onDismiss, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!visible && translateY.value === 100) {
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
        },
        animatedStyle,
      ]}
    >
      <Text style={{ color: "white" }}>{message}</Text>
    </Animated.View>
  );
};
