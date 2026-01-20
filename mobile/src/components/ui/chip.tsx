import { Pressable, Text, View } from "react-native";
import Animated, { FadeInLeft, FadeOutLeft } from "react-native-reanimated";

export const Chip = ({
  label,
  isActive,
  onPress,
  icon,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="relative rounded-full px-4 py-2 bg-neutral-200 dark:bg-neutral-800 overflow-hidden"
    >
      {isActive && (
        <Animated.View
          entering={FadeInLeft.springify().damping(100).stiffness(900)}
          exiting={FadeOutLeft.springify().damping(100).stiffness(600)}
          className="absolute inset-0 bg-neutral-900 dark:bg-neutral-100 rounded-full"
        />
      )}
      <View
        className={`flex-row items-center relative z-10 ${
          isActive ? "gap-1.5" : "gap-0"
        }`}
      >
        {icon && (
          <View className={isActive ? "text-white" : "opacity-60"}>
            {icon}
          </View>
        )}
        {isActive && (
          <Text className="text-sm font-semibold text-white dark:text-neutral-900">
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
};
