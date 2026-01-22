import { useRef, useCallback } from "react";
import {
  Animated,
  Easing,
  GestureResponderEvent,
  type AnimatedValueXY,
} from "react-native";

export function useButtonAnimation() {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  const animatePress = useCallback(() => {
    // Animation de compression lors du clic
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0.8,
        duration: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleValue, opacityValue]);

  const animateRelease = useCallback(() => {
    // Animation de rebond au relâchement
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleValue, opacityValue]);

  return {
    scaleValue,
    opacityValue,
    animatePress,
    animateRelease,
  };
}
