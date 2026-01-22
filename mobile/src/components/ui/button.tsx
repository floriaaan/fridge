import React from "react";
import { GestureResponderEvent, Text } from "react-native";
import { AnimatedTouchableOpacity } from "./animated-touchable-opacity";

type ButtonProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: any;
  disabled?: boolean;
  testID?: string;
};

export function Button({ title, onPress, style, disabled, testID }: ButtonProps) {
  return (
    <AnimatedTouchableOpacity
      disabled={disabled}
      className="bg-blue-500 rounded-lg py-3 px-4 items-center justify-center my-1"
      style={style}
      onPress={onPress}
      testID={testID}
    >
      <Text className="text-white text-base font-semibold">{title}</Text>
    </AnimatedTouchableOpacity>
  );
}
