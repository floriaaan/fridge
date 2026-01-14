import React, { useEffect, useState } from "react";
import { View, Modal, TouchableWithoutFeedback, Keyboard } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutUp } from "react-native-reanimated";

interface AnimatedModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  visible,
  onClose,
  children,
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        className="flex-1 bg-black/50 justify-end"
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1" />
        </TouchableWithoutFeedback>
        <Animated.View
          entering={SlideInDown.springify()}
          exiting={SlideOutUp.springify()}
          className="bg-white rounded-t-3xl p-4"
        >
          {children}
          <View style={{ height: keyboardHeight }} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
