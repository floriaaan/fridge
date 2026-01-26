import React from "react";
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useShoppingItems } from "@/hooks/use-shopping-items";
import { useUpdateShoppingItems } from "@/hooks/use-update-shopping-items";
import { ShoppingItemCard } from "@/components/shopping-item-card";
import { ShoppingItemAddCard } from "@/components/shopping-item-add-card";
import { Chip } from "@/components/ui/chip";
import Header from "@/components/ui/header";
import { EmptyState } from "@/components/empty-state";
import { useTranslation } from "@/hooks/use-translation";
import { BottomFloatingContainer } from "@/components/ui/bottom-floating-container";

export default function ShoppingListScreen() {
  const {
    data: items = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useShoppingItems();
  const { mutate: updateShoppingItems } = useUpdateShoppingItems();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "pending" | "done"
  >("all");
  const [sourceFilter, setSourceFilter] = React.useState<
    "all" | "manual" | "auto_expired" | "recipe"
  >("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleToggleCheck = React.useCallback(
    (itemId: string) => {
      const target = items.find((item) => item.id === itemId);
      if (!target) return;

      updateShoppingItems([{ id: itemId, checked: !target.checked }]);
    },
    [items, updateShoppingItems],
  );

  const filteredItems = React.useMemo(() => {
    return items
      .filter((item) => {
        const isChecked = Boolean(item.checked);
        if (statusFilter === "all") return true;
        if (statusFilter === "pending") return !isChecked;
        return isChecked;
      })
      .filter((item) => {
        if (sourceFilter === "all") return true;
        return item.source === sourceFilter;
      })
      .filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
  }, [items, statusFilter, sourceFilter, searchQuery]);

  const inactiveIconColor = isDark ? "#a3a3a3" : "#737373";
  const activeIconColor = isDark ? "#171717" : "#ffffff";

  if (isError) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView
          edges={["top", "left", "right"]}
          className="flex-1 bg-neutral-50 dark:bg-black"
        >
          <Header title={t("shoppingList.title")} />
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color="#ef4444"
              style={{ marginBottom: 12 }}
            />
            <Text className="text-neutral-900 dark:text-neutral-100 font-semibold mb-1">
              {t("common.error")}
            </Text>
            <Text className="text-neutral-500 dark:text-neutral-400 text-center">
              {error?.message}
            </Text>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 bg-neutral-50 dark:bg-black"
      >
        <Header title={t("shoppingList.title")} />

        {/* Combined filters */}
        <ScrollView
          horizontal
          className="flex-grow-0"
          contentContainerClassName="flex items-center gap-1 flex flex-row mb-4 px-4 h-12"
          showsHorizontalScrollIndicator={false}
        >
          {/* Status filters */}
          <Chip
            label={t("common.all")}
            isActive={statusFilter === "all"}
            onPress={() => setStatusFilter("all")}
            icon={
              <Ionicons
                name="list"
                size={16}
                color={
                  statusFilter === "all" ? activeIconColor : inactiveIconColor
                }
              />
            }
          />
          <Chip
            label={t("shoppingList.toBuy")}
            isActive={statusFilter === "pending"}
            onPress={() => setStatusFilter("pending")}
            icon={
              <Ionicons
                name="cart-outline"
                size={16}
                color={
                  statusFilter === "pending"
                    ? activeIconColor
                    : inactiveIconColor
                }
              />
            }
          />
          <Chip
            label={t("shoppingList.completed")}
            isActive={statusFilter === "done"}
            onPress={() => setStatusFilter("done")}
            icon={
              <Ionicons
                name="checkmark-done"
                size={16}
                color={
                  statusFilter === "done" ? activeIconColor : inactiveIconColor
                }
              />
            }
          />

          {/* Vertical separator */}
          <View className="w-px h-6 bg-neutral-300 dark:bg-neutral-700 mx-1" />

          {/* Source filters */}
          <Chip
            label={t("shoppingList.allSources")}
            isActive={sourceFilter === "all"}
            onPress={() => setSourceFilter("all")}
            icon={
              <Ionicons
                name="grid-outline"
                size={16}
                color={
                  sourceFilter === "all" ? activeIconColor : inactiveIconColor
                }
              />
            }
          />
          <Chip
            label={t("shoppingList.manual")}
            isActive={sourceFilter === "manual"}
            onPress={() => setSourceFilter("manual")}
            icon={
              <Ionicons
                name="create-outline"
                size={16}
                color={
                  sourceFilter === "manual"
                    ? activeIconColor
                    : inactiveIconColor
                }
              />
            }
          />
          <Chip
            label={t("shoppingList.autoExpired")}
            isActive={sourceFilter === "auto_expired"}
            onPress={() => setSourceFilter("auto_expired")}
            icon={
              <MaterialIcons
                name="history-toggle-off"
                size={16}
                color={
                  sourceFilter === "auto_expired"
                    ? activeIconColor
                    : inactiveIconColor
                }
              />
            }
          />
          <Chip
            label={t("shoppingList.fromRecipes")}
            isActive={sourceFilter === "recipe"}
            onPress={() => setSourceFilter("recipe")}
            icon={
              <Ionicons
                name="restaurant-outline"
                size={16}
                color={
                  sourceFilter === "recipe"
                    ? activeIconColor
                    : inactiveIconColor
                }
              />
            }
          />
        </ScrollView>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={isDark ? "white" : "black"}
            />
          }
        >
          <View className="px-4 mb-4">
            <View className="flex-row items-center bg-neutral-200 dark:bg-neutral-800 rounded-xl px-4 py-3">
              <MaterialIcons
                name="search"
                size={20}
                color={inactiveIconColor}
              />
              <TextInput
                className="flex-1 ml-3 text-neutral-900 dark:text-neutral-100"
                onChangeText={setSearchQuery}
                value={searchQuery}
                placeholder={t("shoppingList.searchPlaceholder")}
                placeholderTextColor={isDark ? "#737373" : "#a3a3a3"}
              />
            </View>
          </View>

          {isLoading && items.length === 0 ? (
            <View className="flex-1 items-center justify-center mt-10">
              <ActivityIndicator
                size="large"
                color={isDark ? "white" : "black"}
              />
              <Text className="text-neutral-500 dark:text-neutral-400 mt-3">
                {t("shoppingList.loadingItems")}
              </Text>
            </View>
          ) : (
            <>
              {filteredItems.length > 0 ? (
                <View className="flex flex-col flex-1 px-4 gap-3">
                  {filteredItems.map((item, index) => (
                    <ShoppingItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      onToggleCheck={handleToggleCheck}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState
                  icon="cart-outline"
                  title={t("shoppingList.noItems")}
                  subtitle={
                    items.length === 0
                      ? t("shoppingList.addItemHint")
                      : t("common.search")
                  }
                  marginTop="mt-16"
                />
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <BottomFloatingContainer>
        <ShoppingItemAddCard
          defaultUnit="pcs"
          defaultQuantity={1}
          onCreated={() => {
            refetch();
          }}
        />
      </BottomFloatingContainer>
    </GestureHandlerRootView>
  );
}
