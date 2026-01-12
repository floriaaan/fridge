import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { AnimatedModal } from "./animated-modal";
import DateTimePicker from "@react-native-community/datetimepicker";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string | undefined;
  onDateSelect: (date: string) => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  selectedDate,
  onDateSelect,
}) => {
  const [date, setDate] = useState(new Date(selectedDate || new Date()));

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      onClose();
    }
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split("T")[0];
      onDateSelect(formattedDate);
    }
  };

  return (
    <AnimatedModal visible={visible} onClose={onClose}>
      <View className="gap-3 min-h-96">
        <Text className="text-lg font-bold text-gray-900">Sélectionner une date</Text>
        <DateTimePicker value={date} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={handleDateChange} />
        {Platform.OS === "ios" && (
          <TouchableOpacity className="bg-gray-900 rounded-lg p-3" onPress={onClose}>
            <Text className="text-white text-center font-semibold">Confirmer</Text>
          </TouchableOpacity>
        )}
      </View>
    </AnimatedModal>
  );
};
