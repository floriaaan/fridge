import React from "react";
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useShoppingItems } from "@/hooks/use-shopping-items";
import { useUpdateShoppingItems } from "@/hooks/use-update-shopping-items";
import { ShoppingItemCard } from "@/components/shopping-item-card";
import { ShoppingItemAddCard } from "@/components/shopping-item-add-card";
import { Chip } from "@/components/ui/chip";
import Header from "@/components/ui/header";

export default function ShoppingListScreen() {
  const {
    data: items = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useShoppingItems();
  const { mutate: updateShoppingItems } = useUpdateShoppingItems();

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
    [items, updateShoppingItems]
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
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
  }, [items, statusFilter, sourceFilter, searchQuery]);

  if (isError) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-gray-50">
          <Header title="Shopping List" />
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color="#ef4444"
              style={{ marginBottom: 12 }}
            />
            <Text className="text-gray-900 font-semibold mb-1">
              Error fetching data
            </Text>
            <Text className="text-gray-500 text-center">{error?.message}</Text>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-gray-50">
        <Header title="Shopping List" />

      {/* Combined filters */}
      <ScrollView
        horizontal
        className="flex-grow-0"
        contentContainerClassName="flex items-center gap-1 flex flex-row mb-4 px-4 h-12"
        showsHorizontalScrollIndicator={false}
      >
        {/* Status filters */}
        <Chip
          label="All"
          isActive={statusFilter === "all"}
          onPress={() => setStatusFilter("all")}
          icon={
            <Ionicons
              name="list"
              size={16}
              color={statusFilter === "all" ? "white" : "#6B7280"}
            />
          }
        />
        <Chip
          label="To buy"
          isActive={statusFilter === "pending"}
          onPress={() => setStatusFilter("pending")}
          icon={
            <Ionicons
              name="cart-outline"
              size={16}
              color={statusFilter === "pending" ? "white" : "#6B7280"}
            />
          }
        />
        <Chip
          label="Completed"
          isActive={statusFilter === "done"}
          onPress={() => setStatusFilter("done")}
          icon={
            <Ionicons
              name="checkmark-done"
              size={16}
              color={statusFilter === "done" ? "white" : "#6B7280"}
            />
          }
        />
        
        {/* Vertical separator */}
        <View className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Source filters */}
        <Chip
          label="All sources"
          isActive={sourceFilter === "all"}
          onPress={() => setSourceFilter("all")}
          icon={
            <Ionicons
              name="grid-outline"
              size={16}
              color={sourceFilter === "all" ? "white" : "#6B7280"}
            />
          }
        />
        <Chip
          label="Manual"
          isActive={sourceFilter === "manual"}
          onPress={() => setSourceFilter("manual")}
          icon={
            <Ionicons
              name="create-outline"
              size={16}
              color={sourceFilter === "manual" ? "white" : "#6B7280"}
            />
          }
        />
        <Chip
          label="Auto (expired)"
          isActive={sourceFilter === "auto_expired"}
          onPress={() => setSourceFilter("auto_expired")}
          icon={
            <MaterialIcons
              name="history-toggle-off"
              size={16}
              color={sourceFilter === "auto_expired" ? "white" : "#6B7280"}
            />
          }
        />
        <Chip
          label="From recipes"
          isActive={sourceFilter === "recipe"}
          onPress={() => setSourceFilter("recipe")}
          icon={
            <Ionicons
              name="restaurant-outline"
              size={16}
              color={sourceFilter === "recipe" ? "white" : "#6B7280"}
            />
          }
        />
      </ScrollView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="black"
          />
        }
      >
        <View className="px-4 mb-4">
          <View className="flex-row items-center bg-gray-200 rounded-xl px-4 py-3">
            <MaterialIcons name="search" size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              onChangeText={setSearchQuery}
              value={searchQuery}
              placeholder="Search items..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {isLoading && items.length === 0 ? (
          <View className="flex-1 items-center justify-center mt-10">
            <ActivityIndicator size="large" color="#000" />
            <Text className="text-gray-500 mt-3">Loading shopping items...</Text>
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
              <View className="flex-1 items-center justify-center mt-16 px-6">
                <Ionicons
                  name="cart-outline"
                  size={48}
                  color="#d1d5db"
                  style={{ marginBottom: 12 }}
                />
                <Text className="text-gray-500 text-lg font-medium mb-1">
                  No items found
                </Text>
                <Text className="text-gray-400 text-sm text-center">
                  {items.length === 0
                    ? "Add products to your shopping list from the fridge tab"
                    : "Try adjusting filters or search"}
                </Text>
              </View>
            )}
            <View className="px-4 py-6">
              <ShoppingItemAddCard defaultUnit="pcs" defaultQuantity={1} />
            </View>
          </>
        )}
      </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
