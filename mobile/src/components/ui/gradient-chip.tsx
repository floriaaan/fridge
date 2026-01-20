import React from "react";
import { Text, View, StyleSheet, Pressable, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

interface GradientChipProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
}

export const GradientChip: React.FC<GradientChipProps> = ({
  label,
  onPress,
  icon,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#262626" : "#ffffff";

  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={["#7C3AED", "#EC4899", "#F59E0B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View
          className="p-[4px] px-3 rounded-full gap-1 flex flex-row items-center"
          style={{ backgroundColor: bgColor }}
        >
          {icon && (
            <MaskedView
              style={{ width: 16, height: 16 }}
              maskElement={
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {icon}
                </View>
              }
            >
              <LinearGradient
                colors={["#7C3AED", "#EC4899", "#F59E0B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 16, height: 16 }}
              />
            </MaskedView>
          )}
          <MaskedView
            style={{ height: 16 }}
            maskElement={
              <View style={{ height: 16, justifyContent: "center" }}>
                <Text className="text-sm font-semibold">{label}</Text>
              </View>
            }
          >
            <LinearGradient
              colors={["#7C3AED", "#EC4899", "#F59E0B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ height: 16 }}
            >
              <View style={{ height: 16, justifyContent: "center" }}>
                <Text className="text-sm font-semibold opacity-0">{label}</Text>
              </View>
            </LinearGradient>
          </MaskedView>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 999,
    padding: 2,
  },
});
