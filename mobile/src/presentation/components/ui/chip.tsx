import { Pressable, Text } from "react-native";
import Animated, { FadeInLeft, FadeOutLeft } from "react-native-reanimated";

export const Chip = ({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="relative rounded-full px-4 py-2 bg-gray-200 overflow-hidden"
    >
      {isActive && (
        <Animated.View
          entering={FadeInLeft.springify().damping(100).stiffness(900)}
          exiting={FadeOutLeft.springify().damping(100).stiffness(600)}
          className="absolute inset-0 bg-black rounded-full"
        />
      )}
      <Text
        className={`text-sm font-semibold relative z-10 ${isActive ? "text-white" : "opacity-60"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
};
