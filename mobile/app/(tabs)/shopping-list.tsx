import { useShoppingItems } from '@/hooks/use-shopping-items';
import { ShoppingItemCard } from '@/components/shopping-item-card';
import { List } from '@/components/ui/list';
import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';

export default function ShoppingListScreen() {
  const { data: items, isLoading, isError, error } = useShoppingItems();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading shopping items...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error fetching data</Text>
        <Text>{error?.message}</Text>
      </View>
    );
  }

  return <List data={items} renderItem={({ item }) => <ShoppingItemCard item={item} />} keyExtractor={(item) => item.id} />;
}
