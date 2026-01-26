import React from "react";
import { View, Modal, TouchableWithoutFeedback } from "react-native";
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
  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        className="flex-1 bg-black/50 justify-end px-2 pb-2"
        style={{ borderRadius: 24 }}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1" />
        </TouchableWithoutFeedback>
        <Animated.View
          entering={SlideInDown.springify()}
          exiting={SlideOutUp.springify()}
          className="bg-white dark:bg-neutral-800 p-4 mb-2"
          style={{ borderRadius: 24 }}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
