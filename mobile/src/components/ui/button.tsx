import React from "react";
import { TouchableOpacity, Text, type TouchableOpacityProps } from "react-native";

type ButtonProps = TouchableOpacityProps & {
  title: string;
};

export function Button({ title, onPress, style, ...props }: ButtonProps) {
  return (
    <TouchableOpacity
      className="bg-blue-500 rounded-lg py-3 px-4 items-center justify-center my-1"
      style={style}
      onPress={onPress}
      {...props}
    >
      <Text className="text-white text-base font-semibold">{title}</Text>
    </TouchableOpacity>
  );
}
