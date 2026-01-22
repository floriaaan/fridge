import React from "react";
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  type PressableProps,
} from "react-native";
import { useButtonAnimation } from "../../hooks/useButtonAnimation";

type AnimatedPressableProps = Omit<PressableProps, "onPress" | "style"> & {
  onPress?: (event: GestureResponderEvent) => void;
  style?: any;
};

const AnimatedPressableComponent =
  Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({
  onPress,
  style,
  ...props
}: AnimatedPressableProps) {
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
    <AnimatedPressableComponent
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
