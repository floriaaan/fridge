import React from "react";
import {
  Animated,
  GestureResponderEvent,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";
import { useButtonAnimation } from "../../hooks/useButtonAnimation";

type AnimatedTouchableOpacityProps = Omit<
  TouchableOpacityProps,
  "onPress" | "style"
> & {
  onPress?: (event: GestureResponderEvent) => void;
  style?: any;
};

const AnimatedTouchableOpacityComponent =
  Animated.createAnimatedComponent(TouchableOpacity);

export function AnimatedTouchableOpacity({
  onPress,
  style,
  ...props
}: AnimatedTouchableOpacityProps) {
  const { scaleValue, opacityValue, animatePress, animateRelease } =
    useButtonAnimation();

  const handlePressIn = () => {
    animatePress();
  };

  const handlePressOut = () => {
    animateRelease();
  };

  const handlePress = (event: GestureResponderEvent) => {
    onPress?.(event);
  };

  return (
    <AnimatedTouchableOpacityComponent
      activeOpacity={1}
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        style,
        {
          transform: [{ scale: scaleValue }],
          opacity: opacityValue,
        },
      ]}
    />
  );
}
