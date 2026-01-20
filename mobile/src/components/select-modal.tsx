import React from "react";
import { Text, TouchableOpacity, FlatList } from "react-native";
import { AnimatedModal } from "./animated-modal";

interface SelectModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export const SelectModal: React.FC<SelectModalProps> = ({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}) => {
  return (
    <AnimatedModal visible={visible} onClose={onClose}>
      <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">{title}</Text>
      <FlatList
        data={options}
        keyExtractor={(item) => item}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="py-3 border-b border-neutral-200 dark:border-neutral-700"
            onPress={() => {
              onSelect(item);
              onClose();
            }}
          >
            <Text
              className={`text-base ${
                selectedValue === item
                  ? "font-bold text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </AnimatedModal>
  );
};
