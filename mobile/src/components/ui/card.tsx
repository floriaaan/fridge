import React from "react";
import { View, type ViewProps } from "react-native";

type CardProps = ViewProps & {
  children: React.ReactNode;
};

export function Card({ children, style, ...props }: CardProps) {
  return (
    <View
      className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md my-2 mx-4"
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}
