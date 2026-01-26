import React from "react";
import { DynamicColorIOS } from "react-native";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { useTranslation } from "@/hooks/use-translation";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <NativeTabs
      minimizeBehavior="automatic"
      disableTransparentOnScrollEdge
      labelStyle={{
        color: DynamicColorIOS({ dark: "white", light: "black" }),
      }}
      tintColor={DynamicColorIOS({ dark: "white", light: "black" })}
    >
      {/* Shopping List */}
      <NativeTabs.Trigger name="shopping-list">
        <Icon sf={{ default: "cart", selected: "cart.fill" }} />
        <Label>{t("tabs.shoppingList")}</Label>
      </NativeTabs.Trigger>

      {/* Products (index) */}
      <NativeTabs.Trigger name="index">
        <Icon
          sf={{
            default: "list.bullet",
            selected: "list.bullet.rectangle.fill",
          }}
        />
        <Label>{t("tabs.products")}</Label>
      </NativeTabs.Trigger>

      {/* Recipes */}
      <NativeTabs.Trigger name="recipes">
        <Icon
          sf={{ default: "fork.knife", selected: "fork.knife.circle.fill" }}
        />
        <Label>{t("tabs.recipes")}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="gamification">
        <Icon sf={{ default: "trophy", selected: "trophy.fill" }} />
        <Label>{t("tabs.gamification")}</Label>
      </NativeTabs.Trigger>

      {/* Debug */}
      <NativeTabs.Trigger name="debug">
        <Icon sf={{ default: "ant", selected: "ant.fill" }} />
        <Label>{t("tabs.debug")}</Label>
      </NativeTabs.Trigger>

      {/* Omit statistics & settings triggers to keep them off the tab bar */}
    </NativeTabs>
  );
}
