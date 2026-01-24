import React, { useEffect } from "react";
import { Platform, StyleSheet, ViewStyle, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  extraBottom?: number; // additional spacing above the tab bar
};

// Approximate native tab bar heights
const TAB_BAR_HEIGHT_IOS = 50;
const TAB_BAR_HEIGHT_ANDROID = 56;
const PADDING_HORIZONTAL = 20;
const PADDING_VERTICAL = 16;

export function BottomFloatingContainer({ children, style, extraBottom = 0 }: Props) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.select({
    ios: TAB_BAR_HEIGHT_IOS,
    android: TAB_BAR_HEIGHT_ANDROID,
    default: TAB_BAR_HEIGHT_ANDROID,
  });

  const keyboardHeight = useSharedValue(0);
  const paddingHorizontal = useSharedValue(PADDING_HORIZONTAL);
  const paddingVertical = useSharedValue(PADDING_VERTICAL);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent as any, (e: any) => {
      const height = e?.endCoordinates?.height ?? 0;
      keyboardHeight.value = withTiming(height, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      paddingHorizontal.value = withTiming(0, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      paddingVertical.value = withTiming(12, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    });

    const hideSub = Keyboard.addListener(hideEvent as any, () => {
      keyboardHeight.value = withTiming(0, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      paddingHorizontal.value = withTiming(PADDING_HORIZONTAL, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      paddingVertical.value = withTiming(PADDING_VERTICAL, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const baseBottom = (insets.bottom || 0) + (tabBarHeight || 0) + extraBottom;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      bottom:
        keyboardHeight.value > 0
          ? Math.max(0, keyboardHeight.value - 24)
          : baseBottom,
      paddingHorizontal: paddingHorizontal.value,
      paddingVertical: paddingVertical.value,
    };
  });

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    overflow: "visible",
  },
});
