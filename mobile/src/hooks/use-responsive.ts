import { useState, useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Device from 'expo-device';

export function useResponsive() {
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation | null>(null);

  useEffect(() => {
    async function getOrientation() {
      const initialOrientation = await ScreenOrientation.getOrientationAsync();
      setOrientation(initialOrientation);
    }

    getOrientation();

    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      setOrientation(event.orientationInfo.orientation);
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  const isLandscape =
    orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
    orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

  return { isTablet: Device.deviceType === Device.DeviceType.TABLET, isLandscape };
}
