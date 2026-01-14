import { Platform, ViewStyle } from "react-native";

interface ShadowProps {
  elevation?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowRadius?: number;
  shadowOffset?: {
    width: number;
    height: number;
  };
}

/**
 * Hook to generate consistent shadow styles across the app
 * @param options - Shadow configuration options
 * @returns Shadow style object for React Native components
 */
export const useShadow = (options?: ShadowProps): ViewStyle => {
  const {
    elevation = 5,
    shadowColor = "#000",
    shadowOpacity = 0.2,
    shadowRadius = 3.84,
    shadowOffset = {
      width: 0,
      height: 2,
    },
  } = options || {};

  // iOS shadows
  const iosShadow: ViewStyle = {
    shadowColor,
    shadowOpacity,
    shadowRadius,
    shadowOffset,
  };

  // Android elevation
  const androidShadow: ViewStyle = {
    elevation,
  };

  // Return platform-specific shadow styles
  return Platform.OS === "ios" ? iosShadow : { ...iosShadow, ...androidShadow };
};



export default useShadow;
