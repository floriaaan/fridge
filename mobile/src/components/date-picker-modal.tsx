import React, { useState } from "react";
import { View, Text, Platform } from "react-native";
import { AnimatedModal } from "./animated-modal";
import { AnimatedTouchableOpacity } from "./ui/animated-touchable-opacity";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "@/hooks/use-translation";

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
  const { t } = useTranslation();

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
        <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{t("datePicker.selectDate")}</Text>
         <DateTimePicker value={date} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={handleDateChange} />
         {Platform.OS === "ios" && (
           <AnimatedTouchableOpacity className="bg-neutral-900 dark:bg-neutral-100 rounded-lg p-3" onPress={onClose}>
             <Text className="text-white dark:text-neutral-900 text-center font-semibold">{t("common.confirm")}</Text>
           </AnimatedTouchableOpacity>
         )}
      </View>
    </AnimatedModal>
  );
};
